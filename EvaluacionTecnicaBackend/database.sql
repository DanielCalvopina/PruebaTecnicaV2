CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS producto (
    pro_id uuid NOT NULL DEFAULT gen_random_uuid(),
    pro_nombre varchar(120) NOT NULL,
    pro_descripcion varchar(500) NULL,
    pro_categoria varchar(80) NOT NULL,
    pro_imagen varchar(500) NULL,
    pro_precio numeric(18,2) NOT NULL
        CONSTRAINT ckc_pro_precio_producto CHECK (pro_precio >= 0),
    pro_stock integer NOT NULL
        CONSTRAINT ckc_pro_stock_producto CHECK (pro_stock >= 0),
    pro_activo boolean NOT NULL DEFAULT true,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    fecha_actualizacion timestamp with time zone NULL,
    CONSTRAINT pk_producto PRIMARY KEY (pro_id)
);

CREATE INDEX IF NOT EXISTS ix_producto_nombre ON producto (pro_nombre);
CREATE INDEX IF NOT EXISTS ix_producto_categoria ON producto (pro_categoria);

CREATE TABLE IF NOT EXISTS transaccion_inventario (
    tra_id uuid NOT NULL DEFAULT gen_random_uuid(),
    tra_fecha timestamp with time zone NOT NULL DEFAULT now(),
    tra_tipo varchar(20) NOT NULL
        CONSTRAINT ckc_tra_tipo_transaccion CHECK (tra_tipo IN ('Compra','Venta')),
    pro_id uuid NOT NULL,
    tra_cantidad integer NOT NULL
        CONSTRAINT ckc_tra_cantidad_transaccion CHECK (tra_cantidad > 0),
    tra_precio_unitario numeric(18,2) NOT NULL
        CONSTRAINT ckc_tra_precio_unitario_transaccion CHECK (tra_precio_unitario >= 0),
    tra_precio_total numeric(18,2) NOT NULL
        CONSTRAINT ckc_tra_precio_total_transaccion CHECK (tra_precio_total >= 0),
    tra_detalle varchar(500) NULL,
    tra_eliminada boolean NOT NULL DEFAULT false,
    fecha_creacion timestamp with time zone NOT NULL DEFAULT now(),
    fecha_actualizacion timestamp with time zone NULL,
    CONSTRAINT pk_transaccion_inventario PRIMARY KEY (tra_id),
    CONSTRAINT fk_transaccion_producto FOREIGN KEY (pro_id)
        REFERENCES producto (pro_id)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_transaccion_producto ON transaccion_inventario (pro_id);
CREATE INDEX IF NOT EXISTS ix_transaccion_tipo ON transaccion_inventario (tra_tipo);
CREATE INDEX IF NOT EXISTS ix_transaccion_fecha ON transaccion_inventario (tra_fecha);
