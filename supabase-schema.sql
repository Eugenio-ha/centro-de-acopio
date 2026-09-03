-- ================================================
-- SISTEMA DE CENTROS DE ACOPIO - ESQUEMA DE BASE DE DATOS
-- Copia y ejecuta este script en el SQL Editor de Supabase
-- ================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('coordinador', 'encargado', 'voluntario', 'institucion')) NOT NULL,
  centro_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de centros de acopio
CREATE TABLE IF NOT EXISTS centros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  lat DECIMAL,
  lng DECIMAL,
  encargado_id UUID REFERENCES usuarios(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de campanas
CREATE TABLE IF NOT EXISTS campanas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos (calcula inventario)
CREATE TABLE IF NOT EXISTS movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_id UUID NOT NULL REFERENCES centros(id),
  tipo TEXT CHECK (tipo IN (
    'recepcion', 
    'entrega', 
    'merma', 
    'transferencia_salida', 
    'transferencia_entrada',
    'ajuste_positivo', 
    'ajuste_negativo'
  )) NOT NULL,
  producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  notas TEXT,
  motivo TEXT,
  destino_id UUID,
  campana_id UUID REFERENCES campanas(id),
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE centros ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- ================================================
-- POLITICAS RLS - USUARIOS
-- ================================================

-- Cualquier usuario autenticado puede ver todos los usuarios
CREATE POLICY "Usuarios pueden ver todos los usuarios" ON usuarios
  FOR SELECT USING (true);

-- Usuario autenticado puede insertar su propio perfil (auto-registro)
CREATE POLICY "Usuarios autenticados pueden crear su perfil" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuario puede actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- ================================================
-- POLITICAS RLS - CENTROS
-- ================================================

-- Todos pueden ver centros
CREATE POLICY "Todos pueden ver centros" ON centros
  FOR SELECT USING (true);

-- Coordinadores pueden crear centros
CREATE POLICY "Coordinadores pueden crear centros" ON centros
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- Coordinadores pueden actualizar centros
CREATE POLICY "Coordinadores pueden actualizar centros" ON centros
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- Coordinadores pueden eliminar centros
CREATE POLICY "Coordinadores pueden eliminar centros" ON centros
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- ================================================
-- POLITICAS RLS - CAMPANAS
-- ================================================

-- Todos pueden ver campanas
CREATE POLICY "Todos pueden ver campanas" ON campanas
  FOR SELECT USING (true);

-- Coordinadores pueden crear campanas
CREATE POLICY "Coordinadores pueden crear campanas" ON campanas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- Coordinadores pueden actualizar campanas
CREATE POLICY "Coordinadores pueden actualizar campanas" ON campanas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- Coordinadores pueden eliminar campanas
CREATE POLICY "Coordinadores pueden eliminar campanas" ON campanas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- ================================================
-- POLITICAS RLS - MOVIMIENTOS
-- ================================================

-- Coordinadores pueden ver todos los movimientos
CREATE POLICY "Coordinadores pueden ver todos los movimientos" ON movimientos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'coordinador'
    )
  );

-- Encargados y voluntarios solo ven movimientos de su centro
CREATE POLICY "Encargados y voluntarios ven movimientos de su centro" ON movimientos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol IN ('encargado', 'voluntario')
      AND centro_id = movimientos.centro_id
    )
  );

-- Instituciones ven entregas destinadas a ellas
CREATE POLICY "Instituciones ven sus entregas" ON movimientos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'institucion'
    )
    AND tipo = 'entrega' 
    AND destino_id = auth.uid()
  );

-- Usuarios autenticados pueden crear movimientos
CREATE POLICY "Usuarios autenticados pueden crear movimientos" ON movimientos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ================================================
-- FUNCION PARA CALCULAR INVENTARIO
-- ================================================

CREATE OR REPLACE FUNCTION calcular_inventario(p_centro_id UUID)
RETURNS TABLE(producto TEXT, stock BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.producto,
    SUM(CASE 
      WHEN m.tipo IN ('recepcion', 'transferencia_entrada', 'ajuste_positivo') THEN m.cantidad
      WHEN m.tipo IN ('entrega', 'merma', 'transferencia_salida', 'ajuste_negativo') THEN -m.cantidad
      ELSE 0
    END) as stock
  FROM movimientos m
  WHERE m.centro_id = p_centro_id
  GROUP BY m.producto;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGER PARA AUTO-CREAR PERFIL DESPUES DE SIGNUP
-- (Opcional: usar si Supabase Auth no crea el perfil automaticamente)
-- ================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'voluntario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
