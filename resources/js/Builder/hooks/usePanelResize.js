import { useState } from 'react';

export function usePanelResize(initial = 280) {
    const [width, setWidth] = useState(initial);

    const onMouseDown = (e, side = 1) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = width;
        const move = (ev) => setWidth(Math.max(200, Math.min(480, startW + (ev.clientX - startX) * side)));
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    return { width, onMouseDown };
}
