var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let OpticalContinuityEngineService = class OpticalContinuityEngineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async traceFiber(startTerminationId) {
        const start = await this.prisma.opticalTermination.findUnique({ where: { id: startTerminationId } });
        if (!start) {
            return { message: 'Terminación óptica no encontrada.', startTerminationId, totalLossDb: 0, traceSequence: [] };
        }
        const connections = await this.prisma.opticalConnection.findMany({
            where: { deletedAt: null, status: 'ACTIVE' },
            include: { sourceTermination: true, targetTermination: true },
        });
        const terminations = new Map([
            [start.id, start],
        ]);
        const adjacency = new Map();
        const addEdge = (from, to, id, connectionType, lossDb) => {
            const edges = adjacency.get(from) ?? [];
            edges.push({ id, to, connectionType, lossDb });
            adjacency.set(from, edges);
        };
        for (const connection of connections) {
            terminations.set(connection.sourceTermination.id, connection.sourceTermination);
            terminations.set(connection.targetTermination.id, connection.targetTermination);
            const lossDb = connection.lossDb === null ? null : Number(connection.lossDb);
            addEdge(connection.sourceTerminationId, connection.targetTerminationId, connection.id, connection.connectionType, lossDb);
            addEdge(connection.targetTerminationId, connection.sourceTerminationId, connection.id, connection.connectionType, lossDb);
        }
        const splitterCache = new Map();
        const getSplitterPeers = async (terminationId) => {
            const terminal = terminations.get(terminationId);
            if (!terminal || !['SPLITTER_INPUT', 'SPLITTER_OUTPUT'].includes(terminal.entityType))
                return [];
            const port = await this.prisma.splitterPort.findUnique({
                where: { id: terminal.entityId },
                include: { splitter: { include: { ports: true } } },
            });
            if (!port || port.splitter.deletedAt)
                return [];
            let peers = splitterCache.get(port.splitterId);
            if (!peers) {
                peers = [];
                for (const sibling of port.splitter.ports) {
                    let siblingTermination = await this.prisma.opticalTermination.findFirst({
                        where: {
                            entityType: sibling.portType === 'INPUT' ? 'SPLITTER_INPUT' : 'SPLITTER_OUTPUT',
                            entityId: sibling.id,
                        },
                    });
                    if (!siblingTermination) {
                        siblingTermination = await this.prisma.opticalTermination.create({
                            data: {
                                type: sibling.portType === 'INPUT' ? 'SPLITTER_INPUT' : 'SPLITTER_OUTPUT',
                                entityType: sibling.portType === 'INPUT' ? 'SPLITTER_INPUT' : 'SPLITTER_OUTPUT',
                                entityId: sibling.id,
                                boxId: port.splitter.boxId,
                            },
                        });
                    }
                    terminations.set(siblingTermination.id, siblingTermination);
                    peers.push(siblingTermination.id);
                }
                splitterCache.set(port.splitterId, peers);
            }
            return peers.filter((id) => id !== terminationId);
        };
        const traceSequence = [];
        const visited = new Set([startTerminationId]);
        const queue = [{ id: startTerminationId, step: 0, loss: 0 }];
        const label = (id) => {
            const terminal = terminations.get(id);
            return terminal ? `${terminal.entityType} (${terminal.entityId.slice(0, 8)})` : id;
        };
        while (queue.length) {
            const current = queue.shift();
            const directEdges = adjacency.get(current.id) ?? [];
            const splitterPeers = await getSplitterPeers(current.id);
            const virtualEdges = splitterPeers.map((to) => ({
                id: `splitter:${current.id}:${to}`,
                to,
                connectionType: 'SPLITTER_INTERNAL',
                lossDb: null,
            }));
            for (const edge of [...directEdges, ...virtualEdges]) {
                if (visited.has(edge.to))
                    continue;
                visited.add(edge.to);
                const cumulativeLossDb = current.loss + (edge.lossDb ?? 0);
                traceSequence.push({
                    id: edge.id,
                    sourceTerminationId: current.id,
                    targetTerminationId: edge.to,
                    connectionType: edge.connectionType,
                    lossDb: edge.lossDb,
                    step: current.step + 1,
                    sourceLabel: label(current.id),
                    targetLabel: label(edge.to),
                    cumulativeLossDb: Math.round(cumulativeLossDb * 100) / 100,
                });
                queue.push({ id: edge.to, step: current.step + 1, loss: cumulativeLossDb });
            }
        }
        const totalLossDb = Math.max(0, ...traceSequence.map((step) => step.cumulativeLossDb));
        return {
            message: traceSequence.length > 0 ? 'Traza óptica ejecutada' : 'Sin conexiones registradas para esta terminación.',
            startTerminationId,
            totalLossDb: Math.round(totalLossDb * 100) / 100,
            traceSequence,
        };
    }
    async traceFromPon(ponId) {
        const ponTermination = await this.prisma.opticalTermination.findFirst({
            where: { entityType: 'PON_PORT', entityId: ponId }
        });
        if (!ponTermination) {
            return {
                message: 'Puerto PON no tiene terminación óptica registrada.',
                ponId,
                traceSequence: []
            };
        }
        return this.traceFiber(ponTermination.id);
    }
};
OpticalContinuityEngineService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], OpticalContinuityEngineService);
export { OpticalContinuityEngineService };
//# sourceMappingURL=optical-continuity-engine.service.js.map