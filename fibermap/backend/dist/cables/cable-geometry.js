const METERS_PER_DEG_LAT = 110_540;
const METERS_PER_DEG_LNG = 111_320;
function projector(origin) {
    const cos = Math.cos((origin.lat * Math.PI) / 180);
    return (p) => ({
        x: (p.lng - origin.lng) * METERS_PER_DEG_LNG * cos,
        y: (p.lat - origin.lat) * METERS_PER_DEG_LAT,
    });
}
export function distanceMeters(a, b) {
    const p = projector(a)(b);
    return Math.hypot(p.x, p.y);
}
export function nearestWithin(point, candidates, maxMeters) {
    let best = null;
    for (const candidate of candidates) {
        const distance = distanceMeters(point, candidate);
        if (distance <= maxMeters && (!best || distance < best.distance))
            best = { ...candidate, distance };
    }
    return best;
}
export function snapPathToElements(points, elements, tolerance) {
    if (points.length < 2)
        return points.map((p) => ({ ...p }));
    const vertexOwner = new Map();
    const candidates = elements
        .map((element) => {
        let bestVertex = { index: -1, distance: Infinity };
        points.forEach((p, index) => {
            const distance = distanceMeters(element, p);
            if (distance < bestVertex.distance)
                bestVertex = { index, distance };
        });
        return { element, bestVertex };
    })
        .filter((c) => c.bestVertex.distance <= tolerance)
        .sort((a, b) => a.bestVertex.distance - b.bestVertex.distance);
    for (const { element, bestVertex } of candidates) {
        if (!vertexOwner.has(bestVertex.index)) {
            vertexOwner.set(bestVertex.index, { element, distance: bestVertex.distance });
        }
    }
    return points.map((point, index) => {
        const owner = vertexOwner.get(index);
        return owner ? { lat: owner.element.lat, lng: owner.element.lng, element: owner.element } : { ...point };
    });
}
export function connectionsFromPath(path) {
    const seen = new Set();
    const found = [];
    path.forEach((p, pointIndex) => {
        if (!p.element)
            return;
        const key = `${p.element.kind}:${p.element.id}`;
        if (seen.has(key))
            return;
        seen.add(key);
        found.push({ element: p.element, pointIndex });
    });
    return found.map(({ element, pointIndex }, sequence) => ({
        element,
        sequence,
        role: pointIndex === 0 ? 'START' : pointIndex === path.length - 1 ? 'END' : 'PASS',
    }));
}
//# sourceMappingURL=cable-geometry.js.map