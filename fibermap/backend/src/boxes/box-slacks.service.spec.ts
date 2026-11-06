import { describe, expect, it, vi } from 'vitest';
import { BoxSlacksService } from './box-slacks.service.js';
function setup(type = 'NAP') {
 const box = { id: 'b', type, projectId: 'p', deletedAt: null };
 const cable = { id: 'c', code: 'C', projectId: 'p', deletedAt: null };
 const prisma = { box: { findFirst: vi.fn().mockResolvedValue(box), findMany: vi.fn().mockResolvedValue([box]) }, cable: { findFirst: vi.fn().mockResolvedValue(cable) }, cableConnection: { findMany: vi.fn().mockResolvedValue([{ cableId: 'c', elementId: 'b', elementType: type, cable }]) }, cableSlack: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue({ id: 's', cableId: 'c' }), create: vi.fn().mockImplementation(({data}) => data), update: vi.fn().mockImplementation(({data}) => data), delete: vi.fn().mockResolvedValue({id:'s'}) } };
 return { prisma, service: new BoxSlacksService(prisma as never) };
}
describe('physical box cable reserves', () => {
 for (const type of ['NAP', 'MANGA']) it(`creates positive meters at ${type}`, async () => { const {service,prisma}=setup(type); await expect(service.create('b',{cableId:'c',meters:12.5})).resolves.toMatchObject({meters:12.5,locationType:'BOX',locationId:'b'}); expect(prisma.cableSlack.create).toHaveBeenCalledOnce(); });
 for (const meters of [0,-1,NaN,Infinity,'2',null,undefined]) it(`rejects invalid meters ${meters}`, async()=>{ const {service,prisma}=setup(); await expect(service.create('b',{cableId:'c',meters} as never)).rejects.toThrow(); expect(prisma.cableSlack.create).not.toHaveBeenCalled(); });
 for (const type of ['ODF','POSTE']) it(`rejects ${type}`,async()=>{ await expect(setup(type).service.list('b')).rejects.toThrow(); });
 it('rejects missing or deleted boxes',async()=>{ const {service,prisma}=setup(); prisma.box.findFirst.mockResolvedValue(null as never); await expect(service.list('b')).rejects.toThrow(); });
 it('rejects missing, deleted or foreign-project cables',async()=>{ const {service,prisma}=setup(); prisma.cableConnection.findMany.mockResolvedValue([]); await expect(service.create('b',{cableId:'c',meters:2})).rejects.toThrow(); });
 it('scopes update/delete to BOX and owning box',async()=>{ const {service,prisma}=setup(); await service.update('b','s',{meters:3}); await service.remove('b','s'); expect(prisma.cableSlack.findFirst).toHaveBeenCalledWith({where:{id:'s',locationType:'BOX',locationId:'b'}}); });
 it('rejects foreign/ODF record mutations',async()=>{ const {service,prisma}=setup(); prisma.cableSlack.findFirst.mockResolvedValue(null as never); await expect(service.update('b','s',{meters:3})).rejects.toThrow(); await expect(service.remove('b','s')).rejects.toThrow(); });
 it('retains separate records and excludes stale/ODF/wrong-type connections',async()=>{ const {service,prisma}=setup(); prisma.cableSlack.findMany.mockResolvedValue([{id:'1',cableId:'c',locationId:'b',locationType:'BOX',meters:2},{id:'2',cableId:'c',locationId:'b',locationType:'BOX',meters:3},{id:'3',cableId:'gone',locationId:'b',locationType:'BOX',meters:4},{id:'4',cableId:'c',locationId:'b',locationType:'ODF',meters:5}] as never); expect((await service.map()).map(r=>r.id)).toEqual(['1','2']); prisma.cableConnection.findMany.mockResolvedValue([{cableId:'c',elementId:'b',elementType:'MANGA',cable:{id:'c',code:'C',projectId:'p',deletedAt:null}}]); expect(await service.map()).toEqual([]); });
});

// These cases exercise validation independently of Prisma's query filtering.
describe('reserve eligibility and persistence boundaries', () => {
  it('rejects a soft-deleted box even if returned by the data adapter', async () => {
    const { service, prisma } = setup();
    prisma.box.findFirst.mockResolvedValue({ id: 'b', type: 'NAP', projectId: 'p', deletedAt: new Date() } as never);
    await expect(service.create('b', { cableId: 'c', meters: 5 })).rejects.toThrow();
    expect(prisma.cableSlack.create).not.toHaveBeenCalled();
  });
  for (const cable of [
    { id: 'c', code: 'C', projectId: 'other', deletedAt: null },
    { id: 'c', code: 'C', projectId: 'p', deletedAt: new Date() },
  ]) it('rejects a deleted or foreign-project cable and hides its reserves', async () => {
    const { service, prisma } = setup();
    prisma.cableConnection.findMany.mockResolvedValue([{ cableId: 'c', elementId: 'b', elementType: 'NAP', cable }] as never);
    prisma.cableSlack.findMany.mockResolvedValue([{ id: 's', cableId: 'c', locationId: 'b', locationType: 'BOX', meters: 4 }] as never);
    await expect(service.create('b', { cableId: 'c', meters: 5 })).rejects.toThrow();
    await expect(service.update('b', 's', { meters: 5 })).rejects.toThrow();
    expect((await service.list('b')).reservations).toEqual([]);
    expect(await service.map()).toEqual([]);
  });
  it('rejects a connection under the wrong element type or box', async () => {
    for (const connection of [{ elementType: 'MANGA', elementId: 'b' }, { elementType: 'NAP', elementId: 'other' }]) {
      const { service, prisma } = setup();
      prisma.cableConnection.findMany.mockResolvedValue([{ ...connection, cableId: 'c', cable: { id: 'c', code: 'C', projectId: 'p', deletedAt: null } }]);
      await expect(service.create('b', { cableId: 'c', meters: 5 })).rejects.toThrow();
    }
  });
  it('requires an active connection for edit but permits scoped cleanup after disconnection', async () => {
    const { service, prisma } = setup();
    prisma.cableConnection.findMany.mockResolvedValue([]);
    await expect(service.update('b', 's', { meters: 3 })).rejects.toThrow();
    await service.remove('b', 's');
    expect(prisma.cableSlack.update).not.toHaveBeenCalled();
    expect(prisma.cableSlack.delete).toHaveBeenCalledWith({ where: { id: 's' } });
  });
  it('persists only meters on edit and checks the scoped record first', async () => {
    const { service, prisma } = setup();
    await service.update('b', 's', { meters: 7.25 });
    expect(prisma.cableSlack.update).toHaveBeenCalledWith({ where: { id: 's' }, data: { meters: 7.25 } });
    await expect(service.update('b', 's', { meters: '9' } as never)).rejects.toThrow();
  });
  it('queries only active NAP/MANGA boxes and uses one batched connection query', async () => {
    const { service, prisma } = setup();
    await service.map();
    expect(prisma.box.findMany).toHaveBeenCalledWith({ where: { deletedAt: null, type: { in: ['NAP', 'MANGA'] } } });
    expect(prisma.cableConnection.findMany).toHaveBeenCalledOnce();
    expect(prisma.cableConnection.findMany).toHaveBeenCalledWith({ where: { OR: [{ elementId: 'b', elementType: 'NAP', cable: { deletedAt: null, projectId: 'p' } }] }, include: { cable: true } });
  });
});
