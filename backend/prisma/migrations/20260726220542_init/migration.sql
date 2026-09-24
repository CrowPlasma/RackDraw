-- CreateEnum
CREATE TYPE "PortType" AS ENUM ('COPPER', 'SFP_FIBER', 'GBIC_FIBER', 'MGMT', 'POWER');

-- CreateEnum
CREATE TYPE "CableType" AS ENUM ('CAT5E', 'CAT6', 'SM_FIBER', 'MM_FIBER', 'DAC', 'POWER');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "racks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "height_u" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "racks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "rack_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "position_u" INTEGER NOT NULL,
    "height_u" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PortType" NOT NULL,
    "speed" TEXT NOT NULL DEFAULT '1Gbps',
    "direction" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "source_port_id" TEXT NOT NULL,
    "dest_port_id" TEXT NOT NULL,
    "cable_type" "CableType" NOT NULL,
    "cable_color" TEXT NOT NULL,
    "length_meters" DOUBLE PRECISION NOT NULL,
    "label_tag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connections_source_port_id_key" ON "connections"("source_port_id");

-- CreateIndex
CREATE UNIQUE INDEX "connections_dest_port_id_key" ON "connections"("dest_port_id");

-- AddForeignKey
ALTER TABLE "racks" ADD CONSTRAINT "racks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_rack_id_fkey" FOREIGN KEY ("rack_id") REFERENCES "racks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_source_port_id_fkey" FOREIGN KEY ("source_port_id") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_dest_port_id_fkey" FOREIGN KEY ("dest_port_id") REFERENCES "ports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
