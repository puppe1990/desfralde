type Box = {
  left: number
  top: number
  width: number
  height: number
}

export function tapPointPercent(
  box: Box,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  if (box.width <= 0 || box.height <= 0) {
    return { x: 50, y: 50 }
  }

  return {
    x: ((clientX - box.left) / box.width) * 100,
    y: ((clientY - box.top) / box.height) * 100,
  }
}
