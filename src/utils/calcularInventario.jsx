export function calcularStock(movimientos) {
  return movimientos.reduce((stock, mov) => {
    switch(mov.tipo) {
      case 'recepcion':
      case 'transferencia_entrada':
      case 'ajuste_positivo':
        return stock + mov.cantidad;
      case 'entrega':
      case 'merma':
      case 'transferencia_salida':
      case 'ajuste_negativo':
        return stock - mov.cantidad;
      default:
        return stock;
    }
  }, 0);
}

export function agruparPorProducto(movimientos) {
  const inventario = {};
  movimientos.forEach(mov => {
    if (!inventario[mov.producto]) {
      inventario[mov.producto] = 0;
    }
    inventario[mov.producto] += calcularStock([mov]);
  });
  return inventario;
}

export function obtenerInventarioPorCentro(movimientos, centroId) {
  const movimientosCentro = movimientos.filter(m => m.centro_id === centroId);
  const inventario = {};
  
  movimientosCentro.forEach(mov => {
    if (!inventario[mov.producto]) {
      inventario[mov.producto] = 0;
    }
    inventario[mov.producto] += calcularStock([mov]);
  });
  
  return Object.entries(inventario).map(([producto, stock]) => ({
    producto,
    stock: Math.max(0, stock)
  }));
}
