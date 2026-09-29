--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-1.pgdg110+1)
-- Dumped by pg_dump version 15.4 (Debian 15.4-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: fibermap
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO fibermap;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: fibermap
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO fibermap;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: fibermap
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO fibermap;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: fibermap
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _RolePermissions; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public."_RolePermissions" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_RolePermissions" OWNER TO fibermap;

--
-- Name: _UserRoles; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public."_UserRoles" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_UserRoles" OWNER TO fibermap;

--
-- Name: box_ports; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.box_ports (
    id text NOT NULL,
    "boxId" text NOT NULL,
    number integer NOT NULL,
    label text,
    type text NOT NULL,
    status text DEFAULT 'FREE'::text NOT NULL,
    direction text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.box_ports OWNER TO fibermap;

--
-- Name: box_templates; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.box_templates (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "manufacturerId" text,
    "equipmentModelId" text,
    "portCapacity" integer NOT NULL,
    "installationType" text NOT NULL,
    metadata jsonb,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.box_templates OWNER TO fibermap;

--
-- Name: boxes; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.boxes (
    id text NOT NULL,
    code text NOT NULL,
    name text,
    "projectId" text NOT NULL,
    "poleId" text,
    "chamberId" text,
    "ductId" text,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    type text DEFAULT 'OTHER'::text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    capacity integer,
    "portCapacity" integer DEFAULT 0 NOT NULL,
    "usedPorts" integer DEFAULT 0 NOT NULL,
    "installationType" text,
    "manufacturerId" text,
    "equipmentModelId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "mangaType" text
);


ALTER TABLE public.boxes OWNER TO fibermap;

--
-- Name: cable_duct_assignments; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.cable_duct_assignments (
    id text NOT NULL,
    "cableId" text NOT NULL,
    "ductId" text NOT NULL,
    sequence integer NOT NULL,
    "subductIdentifier" text,
    "occupancyUnits" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cable_duct_assignments OWNER TO fibermap;

--
-- Name: cable_route_nodes; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.cable_route_nodes (
    id text NOT NULL,
    "cableId" text NOT NULL,
    sequence integer NOT NULL,
    "nodeType" text NOT NULL,
    "nodeId" text NOT NULL,
    latitude numeric(65,30),
    longitude numeric(65,30),
    "distanceFromPrevious" numeric(65,30)
);


ALTER TABLE public.cable_route_nodes OWNER TO fibermap;

--
-- Name: cable_slacks; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.cable_slacks (
    id text NOT NULL,
    "cableId" text NOT NULL,
    "locationType" text NOT NULL,
    "locationId" text NOT NULL,
    meters numeric(65,30) NOT NULL,
    notes text
);


ALTER TABLE public.cable_slacks OWNER TO fibermap;

--
-- Name: cables; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.cables (
    id text NOT NULL,
    "projectId" text NOT NULL,
    code text NOT NULL,
    name text,
    type text DEFAULT 'DISTRIBUTION'::text NOT NULL,
    "manufacturerId" text,
    model text,
    "fiberCount" integer NOT NULL,
    "tubeCount" integer NOT NULL,
    "fibersPerTube" integer NOT NULL,
    geometry public.geometry(LineString,4326),
    "installationType" text,
    status text DEFAULT 'PLANNED'::text NOT NULL,
    "startNodeType" text,
    "startNodeId" text,
    "endNodeType" text,
    "endNodeId" text,
    "calculatedLengthMeters" numeric(65,30),
    "technicalLengthMeters" numeric(65,30),
    description text,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.cables OWNER TO fibermap;

--
-- Name: chambers; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.chambers (
    id text NOT NULL,
    code text NOT NULL,
    name text,
    "projectId" text NOT NULL,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    type text NOT NULL,
    size text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.chambers OWNER TO fibermap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.customers (
    id text NOT NULL,
    "projectId" text NOT NULL,
    code text,
    name text NOT NULL,
    "documentId" text,
    phone text,
    email text,
    address text,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    status text DEFAULT 'PROSPECT'::text NOT NULL,
    "nearestBoxId" text,
    "distanceToBoxMeters" numeric(65,30),
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.customers OWNER TO fibermap;

--
-- Name: dio_ports; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.dio_ports (
    id text NOT NULL,
    "dioId" text NOT NULL,
    number integer NOT NULL,
    label text,
    status text DEFAULT 'FREE'::text NOT NULL,
    "connectorType" text,
    notes text
);


ALTER TABLE public.dio_ports OWNER TO fibermap;

--
-- Name: dios; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.dios (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "projectId" text NOT NULL,
    "popId" text,
    "rackId" text,
    capacity integer DEFAULT 0 NOT NULL,
    "usedPorts" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.dios OWNER TO fibermap;

--
-- Name: ducts; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.ducts (
    id text NOT NULL,
    code text NOT NULL,
    name text,
    "projectId" text NOT NULL,
    geometry public.geometry(LineString,4326),
    type text NOT NULL,
    "diameterMm" numeric(65,30),
    "ductCount" integer DEFAULT 1 NOT NULL,
    "subductCount" integer DEFAULT 0 NOT NULL,
    capacity integer DEFAULT 0 NOT NULL,
    "occupiedCapacity" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "installationType" text,
    "startNodeType" text,
    "startNodeId" text,
    "endNodeType" text,
    "endNodeId" text,
    notes text,
    "calculatedLengthMeters" numeric(65,30),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.ducts OWNER TO fibermap;

--
-- Name: equipment_manufacturers; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.equipment_manufacturers (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.equipment_manufacturers OWNER TO fibermap;

--
-- Name: equipment_models; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.equipment_models (
    id text NOT NULL,
    "manufacturerId" text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.equipment_models OWNER TO fibermap;

--
-- Name: fiber_reservations; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.fiber_reservations (
    id text NOT NULL,
    "fiberId" text NOT NULL,
    "projectId" text NOT NULL,
    reason text NOT NULL,
    "reservedFor" text,
    "startsAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.fiber_reservations OWNER TO fibermap;

--
-- Name: fiber_segments; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.fiber_segments (
    id text NOT NULL,
    "fiberId" text NOT NULL,
    "startTerminationId" text NOT NULL,
    "endTerminationId" text NOT NULL,
    "lengthMeters" numeric(65,30),
    "calculatedLossDb" numeric(65,30),
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.fiber_segments OWNER TO fibermap;

--
-- Name: fiber_tubes; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.fiber_tubes (
    id text NOT NULL,
    "cableId" text NOT NULL,
    number integer NOT NULL,
    color text NOT NULL,
    label text,
    "fiberCapacity" integer NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.fiber_tubes OWNER TO fibermap;

--
-- Name: fibers; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.fibers (
    id text NOT NULL,
    "cableId" text NOT NULL,
    "tubeId" text NOT NULL,
    number integer NOT NULL,
    "numberInTube" integer NOT NULL,
    color text NOT NULL,
    label text,
    status text DEFAULT 'FREE'::text NOT NULL,
    "attenuationDbPerKm" numeric(65,30),
    description text,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.fibers OWNER TO fibermap;

--
-- Name: infrastructure_relations; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.infrastructure_relations (
    id text NOT NULL,
    "sourceType" text NOT NULL,
    "sourceId" text NOT NULL,
    "targetType" text NOT NULL,
    "targetId" text NOT NULL,
    "relationType" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.infrastructure_relations OWNER TO fibermap;

--
-- Name: network_nodes; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.network_nodes (
    id text NOT NULL,
    "projectId" text NOT NULL,
    code text NOT NULL,
    name text,
    "nodeType" text NOT NULL,
    status text DEFAULT 'PLANNED'::text NOT NULL,
    description text,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    "regionId" text,
    "zoneId" text,
    "parentNodeId" text,
    "externalReference" text,
    metadata jsonb,
    "locationSource" text,
    "accuracyMeters" numeric(65,30),
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.network_nodes OWNER TO fibermap;

--
-- Name: odf_ports; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.odf_ports (
    id text NOT NULL,
    "odfId" text NOT NULL,
    number integer NOT NULL,
    label text,
    status text DEFAULT 'FREE'::text NOT NULL,
    "connectorType" text,
    notes text
);


ALTER TABLE public.odf_ports OWNER TO fibermap;

--
-- Name: odfs; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.odfs (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "projectId" text NOT NULL,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    capacity integer DEFAULT 24 NOT NULL,
    "usedPorts" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.odfs OWNER TO fibermap;

--
-- Name: olt_cards; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.olt_cards (
    id text NOT NULL,
    "slotId" text NOT NULL,
    "manufacturerId" text,
    "equipmentModelId" text,
    code text NOT NULL,
    name text NOT NULL,
    "serialNumber" text,
    "cardType" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "ponPortCapacity" integer DEFAULT 16 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.olt_cards OWNER TO fibermap;

--
-- Name: olt_shelves; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.olt_shelves (
    id text NOT NULL,
    "oltId" text NOT NULL,
    number integer NOT NULL,
    name text,
    "position" integer,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.olt_shelves OWNER TO fibermap;

--
-- Name: olt_slots; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.olt_slots (
    id text NOT NULL,
    "shelfId" text NOT NULL,
    number integer NOT NULL,
    name text,
    "slotType" text DEFAULT 'STANDARD'::text NOT NULL,
    status text DEFAULT 'EMPTY'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.olt_slots OWNER TO fibermap;

--
-- Name: olt_templates; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.olt_templates (
    id text NOT NULL,
    name text NOT NULL,
    "manufacturerId" text,
    "equipmentModelId" text,
    "shelfCount" integer NOT NULL,
    "slotsPerShelf" integer NOT NULL,
    "defaultCardType" text NOT NULL,
    "ponPortsPerCard" integer NOT NULL,
    "defaultPonType" text NOT NULL,
    metadata jsonb,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.olt_templates OWNER TO fibermap;

--
-- Name: olts; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.olts (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "projectId" text NOT NULL,
    "popId" text,
    "rackId" text,
    manufacturer text,
    model text,
    "serialNumber" text,
    "managementIp" text,
    "macAddress" text,
    "firmwareVersion" text,
    "rackPosition" integer,
    "rackUnits" integer,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "odfPortId" text
);


ALTER TABLE public.olts OWNER TO fibermap;

--
-- Name: optical_connections; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.optical_connections (
    id text NOT NULL,
    "sourceTerminationId" text NOT NULL,
    "targetTerminationId" text NOT NULL,
    "connectionType" text NOT NULL,
    "lossDb" numeric(65,30),
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    notes text,
    "spliceMethod" text,
    technician text,
    "splicedAt" timestamp(3) without time zone,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "sourceFiberId" text,
    "targetFiberId" text
);


ALTER TABLE public.optical_connections OWNER TO fibermap;

--
-- Name: optical_connectors; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.optical_connectors (
    id text NOT NULL,
    type text NOT NULL,
    "insertionLossDb" numeric(65,30),
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "containerType" text NOT NULL,
    "containerId" text NOT NULL
);


ALTER TABLE public.optical_connectors OWNER TO fibermap;

--
-- Name: optical_terminations; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.optical_terminations (
    id text NOT NULL,
    type text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "portIdentifier" text,
    "boxId" text,
    "dioId" text,
    "oltId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "odfId" text
);


ALTER TABLE public.optical_terminations OWNER TO fibermap;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO fibermap;

--
-- Name: poles; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.poles (
    id text NOT NULL,
    code text NOT NULL,
    name text,
    "projectId" text NOT NULL,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    material text DEFAULT 'OTHER'::text NOT NULL,
    height numeric(65,30),
    owner text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.poles OWNER TO fibermap;

--
-- Name: pon_ports; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.pon_ports (
    id text NOT NULL,
    "cardId" text NOT NULL,
    "slotId" text NOT NULL,
    "oltId" text NOT NULL,
    number integer NOT NULL,
    label text,
    "ponType" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "maxOnus" integer DEFAULT 128 NOT NULL,
    "configuredOnus" integer DEFAULT 0 NOT NULL,
    "txPower" numeric(65,30),
    "wavelengthDown" integer,
    "wavelengthUp" integer,
    "externalIdentifier" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.pon_ports OWNER TO fibermap;

--
-- Name: pops; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.pops (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "projectId" text NOT NULL,
    address text,
    latitude numeric(65,30) NOT NULL,
    longitude numeric(65,30) NOT NULL,
    geometry public.geometry(Point,4326),
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.pops OWNER TO fibermap;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.projects (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "centerLatitude" numeric(65,30) DEFAULT 0.0 NOT NULL,
    "centerLongitude" numeric(65,30) DEFAULT 0.0 NOT NULL,
    "defaultZoom" integer DEFAULT 15 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.projects OWNER TO fibermap;

--
-- Name: racks; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.racks (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "projectId" text NOT NULL,
    "popId" text NOT NULL,
    "rackUnits" integer DEFAULT 42 NOT NULL,
    "usedUnits" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.racks OWNER TO fibermap;

--
-- Name: regions; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.regions (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "projectId" text NOT NULL,
    geometry public.geometry(Polygon,4326),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.regions OWNER TO fibermap;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO fibermap;

--
-- Name: splitter_ports; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.splitter_ports (
    id text NOT NULL,
    "splitterId" text NOT NULL,
    "portType" text NOT NULL,
    number integer NOT NULL,
    label text,
    status text DEFAULT 'FREE'::text NOT NULL,
    "lossDb" numeric(65,30),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.splitter_ports OWNER TO fibermap;

--
-- Name: splitters; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.splitters (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "boxId" text,
    code text NOT NULL,
    name text,
    ratio text NOT NULL,
    "splitterType" text NOT NULL,
    "inputCount" integer DEFAULT 1 NOT NULL,
    "outputCount" integer DEFAULT 8 NOT NULL,
    "insertionLossDb" numeric(65,30),
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "manufacturerId" text,
    model text,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.splitters OWNER TO fibermap;

--
-- Name: switches; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.switches (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "projectId" text NOT NULL,
    "popId" text,
    "rackId" text,
    "manufacturerId" text,
    "equipmentModelId" text,
    "managementIp" text,
    "portCount" integer DEFAULT 24 NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.switches OWNER TO fibermap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    preferences jsonb
);


ALTER TABLE public.users OWNER TO fibermap;

--
-- Name: zones; Type: TABLE; Schema: public; Owner: fibermap
--

CREATE TABLE public.zones (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "regionId" text NOT NULL,
    "projectId" text NOT NULL,
    geometry public.geometry(Polygon,4326),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.zones OWNER TO fibermap;

--
-- Data for Name: _RolePermissions; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public."_RolePermissions" ("A", "B") FROM stdin;
2d19617f-801e-45d7-a137-ebe7f9314f38	d8a503f4-2762-4d1e-b7e3-357cf9772363
d04e8178-4ef5-4f54-96c0-140139ded7cb	d8a503f4-2762-4d1e-b7e3-357cf9772363
ae4d73f4-cd58-454e-9bf2-f1c31e983374	d8a503f4-2762-4d1e-b7e3-357cf9772363
d28819c4-4760-4e79-882b-5c5e0d246e4b	d8a503f4-2762-4d1e-b7e3-357cf9772363
f5c93a3d-5e35-440b-a618-f9dce7117c1d	d8a503f4-2762-4d1e-b7e3-357cf9772363
64aaa3d2-d63c-4f7d-9b6f-e91e4e630c0e	d8a503f4-2762-4d1e-b7e3-357cf9772363
2d19617f-801e-45d7-a137-ebe7f9314f38	9f45677d-9094-40c2-8050-0810eea57310
d04e8178-4ef5-4f54-96c0-140139ded7cb	9f45677d-9094-40c2-8050-0810eea57310
d28819c4-4760-4e79-882b-5c5e0d246e4b	9f45677d-9094-40c2-8050-0810eea57310
f5c93a3d-5e35-440b-a618-f9dce7117c1d	9f45677d-9094-40c2-8050-0810eea57310
2d19617f-801e-45d7-a137-ebe7f9314f38	243fe513-4f60-46d5-a94b-7f41403cea8f
d28819c4-4760-4e79-882b-5c5e0d246e4b	243fe513-4f60-46d5-a94b-7f41403cea8f
\.


--
-- Data for Name: _UserRoles; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public."_UserRoles" ("A", "B") FROM stdin;
d8a503f4-2762-4d1e-b7e3-357cf9772363	6524953d-40a2-46cb-84d7-a17d1efeab2f
243fe513-4f60-46d5-a94b-7f41403cea8f	a8756567-55d2-4fe4-b1d6-89952a0b2232
\.


--
-- Data for Name: box_ports; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.box_ports (id, "boxId", number, label, type, status, direction, notes, "createdAt", "updatedAt", "deletedAt") FROM stdin;
3dca1900-d916-4f92-8ce8-e783b0a9546e	b966e576-01c0-47c0-afd9-25920082fcc5	2	\N	DROP	FREE	\N	\N	2026-09-17 17:46:58.574	2026-09-17 17:46:58.574	\N
b57cf7e1-8b9f-4d3a-9c68-a74e5456e1cf	b966e576-01c0-47c0-afd9-25920082fcc5	3	\N	DROP	FREE	\N	\N	2026-09-17 17:46:58.574	2026-09-17 17:46:58.574	\N
699218af-2d2e-4300-a086-d72d1416e38e	b966e576-01c0-47c0-afd9-25920082fcc5	4	\N	DROP	FREE	\N	\N	2026-09-17 17:46:58.574	2026-09-17 17:46:58.574	\N
97011940-e41a-41b7-962e-f4e351073d85	b966e576-01c0-47c0-afd9-25920082fcc5	1	\N	DROP	USED	\N	\N	2026-09-17 17:46:58.574	2026-09-17 17:47:10.992	\N
839e0e6c-1789-4b55-b4d3-ee38bf9f5cba	2860dcfb-62bc-469e-b704-f771f9091ba6	2	\N	DROP	FREE	\N	\N	2026-09-17 17:50:57.801	2026-09-17 17:50:57.801	\N
38c8653a-58d7-4455-9fa0-7469e25452c8	2860dcfb-62bc-469e-b704-f771f9091ba6	3	\N	DROP	FREE	\N	\N	2026-09-17 17:50:57.801	2026-09-17 17:50:57.801	\N
619f8367-e354-4abb-8196-acaebd83c408	2860dcfb-62bc-469e-b704-f771f9091ba6	4	\N	DROP	FREE	\N	\N	2026-09-17 17:50:57.801	2026-09-17 17:50:57.801	\N
8fdca5ca-d929-41e4-8f53-4997155232e3	2860dcfb-62bc-469e-b704-f771f9091ba6	1	\N	DROP	USED	\N	\N	2026-09-17 17:50:57.801	2026-09-17 17:51:40.035	\N
30d47745-ba1e-4496-a7fd-08a1404f9c12	e82e697a-3c81-45d7-ad64-7e65be0a7077	2	\N	DROP	FREE	\N	\N	2026-09-17 18:03:34.835	2026-09-17 18:03:34.835	\N
daa1cb63-6b30-4871-b996-98fd49bb4e8b	e82e697a-3c81-45d7-ad64-7e65be0a7077	1	\N	DROP	USED	\N	\N	2026-09-17 18:03:34.835	2026-09-17 18:03:35.326	\N
3546335f-1ee9-4bc0-8ebe-73d37a110be3	6c9401cb-37ff-460c-bae2-dbed3e67c6d9	1	\N	DROP	FREE	\N	\N	2026-09-17 20:42:43.185	2026-09-17 20:42:43.185	\N
7ecb3cce-8362-42b0-95b3-a97e0799a73b	6c9401cb-37ff-460c-bae2-dbed3e67c6d9	2	\N	DROP	FREE	\N	\N	2026-09-17 20:42:43.185	2026-09-17 20:42:43.185	\N
6718bbfe-11b2-4ebe-a747-a89754e76ee1	0d67c559-0303-432a-8803-1df4f144c2cd	1	\N	DROP	FREE	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:28.039	\N
c7572cec-e762-4f7e-98e3-584970346af0	0d67c559-0303-432a-8803-1df4f144c2cd	2	\N	DROP	FREE	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:28.039	\N
d2db320d-6db5-4eb3-87f3-d93df12f0303	0d67c559-0303-432a-8803-1df4f144c2cd	3	\N	DROP	FREE	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:28.039	\N
8d829849-58a6-4d31-a32a-a7a9cfad8db2	0d67c559-0303-432a-8803-1df4f144c2cd	4	\N	DROP	FREE	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:28.039	\N
790242ba-49c2-4eb1-afbc-9967025976ab	0d67c559-0303-432a-8803-1df4f144c2cd	6	\N	DROP	FREE	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:28.039	\N
5998d8c7-6b24-48e2-a636-a783d1c7d727	0d67c559-0303-432a-8803-1df4f144c2cd	7	\N	DROP	FREE	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:28.039	\N
13c6b069-2321-48be-abc0-b1b7d76ad1cd	0d67c559-0303-432a-8803-1df4f144c2cd	5	\N	DROP	USED	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:55.266	\N
7adfd6fd-8ede-4dec-af29-eab4181bcd7c	0d67c559-0303-432a-8803-1df4f144c2cd	8	\N	DROP	USED	\N	\N	2026-09-18 03:52:28.039	2026-09-18 03:52:55.266	\N
\.


--
-- Data for Name: box_templates; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.box_templates (id, name, type, "manufacturerId", "equipmentModelId", "portCapacity", "installationType", metadata, active) FROM stdin;
\.


--
-- Data for Name: boxes; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.boxes (id, code, name, "projectId", "poleId", "chamberId", "ductId", latitude, longitude, geometry, type, status, description, capacity, "portCapacity", "usedPorts", "installationType", "manufacturerId", "equipmentModelId", "createdAt", "updatedAt", "deletedAt", "mangaType") FROM stdin;
46a442c5-8d5b-415d-8644-ca0cdc7c7348	NAP-TEST	NAP-TEST	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.712800000000000000000000000000	-74.006000000000000000000000000000	0101000020E6100000AAF1D24D628052C05E4BC8073D5B4440	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 15:26:46.946	2026-09-17 15:26:59.693	2026-09-17 15:26:59.691	\N
9bd3453e-9d6b-489d-834b-cd07150aa508	sm4509-8	sm4509-8	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.906536052741856000000000000000	-78.986024907574630000000000000000	0101000020E6100000C4C436081BBF53C09F5E59F9954007C0	NAP	ACTIVE	\N	\N	0	0	\N	\N	\N	2026-09-18 03:57:55.719	2026-09-18 03:57:55.719	\N	\N
ef3568c6-1e65-4bb6-9f80-672f4ff46d21	NAP-DEMO	NAP-DEMO	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.712800000000000000000000000000	-74.006000000000000000000000000000	0101000020E6100000AAF1D24D628052C05E4BC8073D5B4440	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 15:30:25.488	2026-09-17 15:31:14.827	2026-09-17 15:31:14.825	\N
a9001657-727c-4d0d-b9f4-ec8745831c71	sm0202-2	sm0202-2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.907160000000000000000000000000	-78.986900000000010000000000000000	0101000020E6100000091B9E5E29BF53C036EA211ADD4107C0	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 18:10:02.871	2026-09-17 19:33:52.947	\N	\N
b966e576-01c0-47c0-afd9-25920082fcc5	NAP-EDITOR-TEST	NAP-EDITOR-TEST	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.710000000000000000000000000000	-74.000000000000000000000000000000	0101000020E610000000000000008052C07B14AE47E15A4440	NAP	ACTIVE	\N	8	4	0	\N	\N	\N	2026-09-17 17:46:58.221	2026-09-17 17:47:31.506	2026-09-17 17:47:31.505	\N
d18a118b-c9d3-4c1b-830b-0f1b26240ca5	sm0203-1	sm0203-1	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.907130000000000000000000000000	-78.990015000000000000000000000000	0101000020E61000002AE3DF675CBF53C08BC3995FCD4107C0	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 18:13:52.434	2026-09-17 19:33:53.205	\N	\N
1a8c0c7c-c3fc-4383-99f7-c279fd708d9a	NAP-CUENCA	NAP-CUENCA	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.900600000000000000000000000000	-79.004499999999990000000000000000	0101000020E61000003F355EBA49C053C08638D6C56D3407C0	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 19:31:16.811	2026-09-17 19:34:07.417	2026-09-17 19:34:07.416	\N
2860dcfb-62bc-469e-b704-f771f9091ba6	NAP-DEMO-UI	NAP-DEMO-UI	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.710000000000000000000000000000	-74.000000000000000000000000000000	0101000020E610000000000000008052C07B14AE47E15A4440	NAP	ACTIVE	\N	8	4	0	\N	\N	\N	2026-09-17 17:50:42.856	2026-09-17 17:51:54.9	2026-09-17 17:51:54.899	\N
a3dbc9fc-7a6e-43c0-859f-f408385e55d9	NAP-UI-TEST2	NAP-UI-TEST2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	19.432600000000000000000000000000	-99.133200000000000000000000000000	0101000020E6100000F1F44A5986C858C0E63FA4DFBE6E3340	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 17:55:35.087	2026-09-17 17:56:56.338	2026-09-17 17:56:56.337	\N
351256f1-86eb-4385-a25a-760afca079a3	NAP-SPLIT-TEST	NAP-SPLIT-TEST	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.710000000000000000000000000000	-74.000000000000000000000000000000	0101000020E610000000000000008052C07B14AE47E15A4440	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 17:57:04.038	2026-09-17 17:58:33.965	2026-09-17 17:58:33.964	\N
b1a161b0-492c-45fd-8e52-a82bd3f682ec	NAP-DEBUG	NAP-DEBUG	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.905000000000000000000000000000	-78.989000000000000000000000000000	0101000020E61000009EEFA7C64BBF53C03D0AD7A3703D07C0	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 19:50:39.821	2026-09-17 19:53:06.375	2026-09-17 19:53:06.374	\N
e82e697a-3c81-45d7-ad64-7e65be0a7077	NAP-TRACE-TEST	NAP-TRACE-TEST	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.710000000000000000000000000000	-74.000000000000000000000000000000	0101000020E610000000000000008052C07B14AE47E15A4440	NAP	ACTIVE	\N	8	2	0	\N	\N	\N	2026-09-17 18:03:34.694	2026-09-17 18:04:43.595	2026-09-17 18:04:43.595	\N
4fc09816-0790-4472-9794-61e7128b0ce8	kfn	kfn	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.903362232119591000000000000000	-78.991836228003620000000000000000	0101000020E6100000DE90A83E7ABF53C061295BFA153A07C0	MANGA	ACTIVE	\N	12	0	0	\N	\N	\N	2026-09-21 14:28:34.965	2026-09-21 14:29:53.726	2026-09-21 14:29:53.723	DISTRIBUCION
4e18a2f2-6ebf-486c-8cd3-05bc1544f182	NAP-REG-01	NAP-REG-01	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.710000000000000000000000000000	-74.000000000000000000000000000000	0101000020E610000000000000008052C07B14AE47E15A4440	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 18:09:14.989	2026-09-17 18:10:32.124	2026-09-17 18:10:32.124	\N
3166f183-24a7-4b7c-8d94-2640dbaa3706	NAP-MAPTEST	NAP-MAPTEST	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	40.715000000000000000000000000000	-74.008000000000000000000000000000	0101000020E61000008D976E12838052C0EC51B81E855B4440	NAP	ACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 18:26:14.859	2026-09-17 18:30:14.453	2026-09-17 18:30:14.452	\N
64d2a80c-aa59-4731-bea2-36ceff429fd4	NAP-EDIT-TEST	NAP-EDITADA	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.905000000000000000000000000000	-78.989000000000000000000000000000	0101000020E61000009EEFA7C64BBF53C03D0AD7A3703D07C0	NAP	INACTIVE	\N	8	0	0	\N	\N	\N	2026-09-17 20:08:30.586	2026-09-17 20:09:55.134	2026-09-17 20:09:55.134	\N
b0066f77-9a4c-4df8-afcf-cd3e1aa579f8	NAP-UNIFICADO	NAP-UNIFICADO	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.904989562187751000000000000000	-78.987984339951180000000000000000	0101000020E61000003B43AB223BBF53C0C08AE62A6B3D07C0	NAP	ACTIVE	\N	\N	0	0	\N	\N	\N	2026-09-17 20:32:46.497	2026-09-17 20:41:23.827	2026-09-17 20:41:23.826	\N
6c9401cb-37ff-460c-bae2-dbed3e67c6d9	SM-0978-1	SM-0978-1	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.905766436833858000000000000000	-78.987810636924370000000000000000	0101000020E6100000CA0E1B4A38BF53C080204079023F07C0	NAP	ACTIVE	\N	\N	2	0	\N	\N	\N	2026-09-17 20:41:54.227	2026-09-17 20:42:43.19	\N	\N
0d67c559-0303-432a-8803-1df4f144c2cd	SM4509-1	SM4509-1	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	-2.903590360017787000000000000000	-78.993729479184850000000000000000	0101000020E6100000E28A874399BF53C0DF0E2A958D3A07C0	NAP	ACTIVE	\N	\N	8	0	\N	\N	\N	2026-09-17 21:41:19.975	2026-09-18 03:52:28.049	\N	\N
\.


--
-- Data for Name: cable_duct_assignments; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.cable_duct_assignments (id, "cableId", "ductId", sequence, "subductIdentifier", "occupancyUnits", "createdAt") FROM stdin;
\.


--
-- Data for Name: cable_route_nodes; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.cable_route_nodes (id, "cableId", sequence, "nodeType", "nodeId", latitude, longitude, "distanceFromPrevious") FROM stdin;
\.


--
-- Data for Name: cable_slacks; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.cable_slacks (id, "cableId", "locationType", "locationId", meters, notes) FROM stdin;
\.


--
-- Data for Name: cables; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.cables (id, "projectId", code, name, type, "manufacturerId", model, "fiberCount", "tubeCount", "fibersPerTube", geometry, "installationType", status, "startNodeType", "startNodeId", "endNodeType", "endNodeId", "calculatedLengthMeters", "technicalLengthMeters", description, version, "createdAt", "updatedAt", "deletedAt") FROM stdin;
2fdb1322-73cb-4689-bba2-5b30187a41ff	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789678971287	\N	DISTRIBUTION	\N	\N	12	1	12	0102000020E610000003000000AC1C5A643BBF53C03D0AD7A3703D07C09EEFA7C64BBF53C0736891ED7C3F07C02506819543BF53C0A8C64B37894107C0	\N	PLANNED	\N	\N	\N	\N	280.568138396107000000000000000000	\N	\N	1	2026-09-17 21:02:51.288	2026-09-17 21:03:03.934	2026-09-17 21:03:03.933
0e92564c-2a47-4dce-b2d5-3d285d0fbefd	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789679246866	\N	DISTRIBUTION	\N	\N	12	1	12	0102000020E610000002000000E7E4BD2EEABE53C0E0E30C170A4707C0CCE4BD8CAABE53C000D43367624B07C0	\N	PLANNED	\N	\N	\N	\N	491.407006976533000000000000000000	\N	\N	1	2026-09-17 21:07:26.869	2026-09-17 21:08:04.648	2026-09-17 21:08:04.647
9748a719-5573-497e-ab32-026425a9153f	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789678890903	\N	DISTRIBUTION	\N	\N	12	1	12	\N	\N	PLANNED	\N	\N	\N	\N	\N	\N	\N	1	2026-09-17 21:01:30.904	2026-09-17 21:08:04.719	2026-09-17 21:08:04.718
1d8a99ad-5f8b-4b49-86af-3b3b6c034146	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789703546382	\N	DISTRIBUTION	\N	\N	12	1	12	0102000020E61000000200000000E5BD3498BF53C0A08546C82F4407C0EFE4BD90F1BE53C0001EC4DF784B07C0	\N	PLANNED	\N	\N	\N	\N	1197.240132549660000000000000000000	\N	\N	1	2026-09-18 03:52:26.386	2026-09-18 03:53:14.064	2026-09-18 03:53:14.063
0ae553c4-73ad-4b48-b4e2-7dde282e3ae1	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789680213809	\N	DISTRIBUTION	\N	\N	12	1	12	0102000020E610000002000000CA0E1B4A38BF53C080204079023F07C02AE3DF675CBF53C08BC3995FCD4107C0	\N	PLANNED	\N	\N	\N	\N	287.743023975147000000000000000000	\N	\N	1	2026-09-17 21:23:33.814	2026-09-18 03:53:14.136	2026-09-18 03:53:14.135
ba80594c-f2df-46d9-8aac-7636f1bc38ce	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789703830748	\N	DISTRIBUTION	\N	\N	12	1	12	0102000020E6100000040000002AE3DF675CBF53C08BC3995FCD4107C0CA0E1B4A38BF53C080204079023F07C0091B9E5E29BF53C036EA211ADD4107C0B783CE141BBF53C000EE19C3944007C0	\N	PLANNED	\N	\N	\N	\N	591.269477676463000000000000000000	\N	\N	1	2026-09-18 03:57:10.75	2026-09-18 03:57:10.75	\N
8f60cbb0-c969-40bb-b4b7-781393694375	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789703962245	\N	DISTRIBUTION	\N	\N	12	1	12	0102000020E6100000080000002AE3DF675CBF53C08BC3995FCD4107C0AAD24CCE71BF53C020CB99E5BE3F07C084464E6E6DBF53C0C02435C5F13E07C083B857CA7DBF53C0E01BF062A93D07C0B27F99AC96BF53C00093EA79863B07C0A06ED7649DBF53C0C0C6AFA9CD3A07C0CC8A87C79CBF53C0DFF2C40DA43A07C0E28A874399BF53C0DF0E2A958D3A07C0	\N	PLANNED	\N	\N	\N	\N	664.635968303131000000000000000000	\N	\N	1	2026-09-18 03:59:22.246	2026-09-18 03:59:22.246	\N
9a3ecc89-941b-4feb-9395-f85f199926dd	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	CABLE-1789704108627	\N	FEEDER	\N	\N	12	1	12	0102000020E610000010000000E28A874399BF53C0DF0E2A958D3A07C0CC8A87C79CBF53C0DFF2C40DA43A07C01197831A96BF53C020A088D85B3B07C06042E3728BBF53C0803DB8C5563C07C08F374A867FBF53C0E00FD1ED553D07C06C50A2F76CBF53C02025E552D03E07C0621D140967BF53C000CD6173643F07C0881FCB8A64BF53C0A0A6C2269F3F07C08814EBA959BF53C0802B4B5DBA4007C08720C02B56BF53C020C1F528114107C06C392CE354BF53C0802E69CF3A4107C0E1160FD753BF53C08036060C364107C0E0A731854EBF53C0C0EF623AC04007C0EC872DD540BF53C0E09DEABF8D3F07C04AFAC79639BF53C0E00C1249E63E07C0CA0E1B4A38BF53C080204079023F07C0	\N	PLANNED	\N	\N	\N	\N	864.321951764971000000000000000000	\N	\N	1	2026-09-18 04:01:48.629	2026-09-18 04:01:48.629	\N
398b47bb-eb02-48eb-a351-8ba82e55199e	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	FIBRA-1789771874232	\N	DISTRIBUTION	\N	\N	48	4	12	0102000020E6100000040000009BDF771457BF53C0A05CCD01163407C02414F99555BF53C020D01C931F3407C0039E437954BF53C0A03AE830273407C082DF77E459BF53C01FAABEC9473607C0	\N	PLANNED	ODF	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	OLT	12ec7a4e-6e8b-48a0-9fca-6b2089c8f423	138.656037610516000000000000000000	\N	\N	1	2026-09-18 22:51:14.234	2026-09-18 22:51:14.234	\N
6555dc1b-f6f6-420c-84ff-6929f40bc951	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	FIBRA-1789777300802	\N	DISTRIBUTION	\N	\N	48	4	12	0102000020E6100000140000009BDF771457BF53C0A05CCD01163407C0FFE477695CBF53C0A0A9FC4A143607C002E5777F64BF53C0E071996CF73707C013E577E378BF53C06030C24D923707C0BBBAFDB57CBF53C0A0AFC855723707C06E7B08F67CBF53C0A0C207A8853707C09CC6662B7DBF53C060D8CC4DA43707C017487CAB7DBF53C02013E643E23707C0257056C67EBF53C080BEE42C723807C024BEDFFB7FBF53C0E05214C1FE3807C03E6279967FBF53C0A0FE14690F3907C080D0185B7BBF53C0A0A4A563313907C00659B50A79BF53C0A0C76809503907C067BECD9F77BF53C0202DE35D553907C0BE83779A77BF53C0604D92AD783907C0C01ED3BF77BF53C0E0E3EFA4AE3907C020058D1A78BF53C0A06EC7A0C83907C028D69F8A78BF53C0C0FF049BEC3907C020D9CA8A79BF53C0409D94EDFD3907C0E3A53E407ABF53C0407F2E3F153A07C0	\N	PLANNED	ODF	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	\N	\N	590.917585133104000000000000000000	\N	\N	1	2026-09-19 00:21:40.816	2026-09-19 00:21:40.816	\N
\.


--
-- Data for Name: chambers; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.chambers (id, code, name, "projectId", latitude, longitude, geometry, type, size, status, description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.customers (id, "projectId", code, name, "documentId", phone, email, address, latitude, longitude, geometry, status, "nearestBoxId", "distanceToBoxMeters", notes, "createdAt", "updatedAt", "deletedAt") FROM stdin;
a6acfad1-ac85-4615-83c3-a6d50717044c	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	Juan Perez	\N	\N	\N	Calle Falsa 123	40.712900000000000000000000000000	-74.006100000000000000000000000000	0101000020E61000005C2041F1638052C0C1A8A44E405B4440	INACTIVE	46a442c5-8d5b-415d-8644-ca0cdc7c7348	13.950000000000000000000000000000	\N	2026-09-17 15:26:47.587	2026-09-17 15:26:59.613	2026-09-17 15:26:59.612
dbe58b8f-6b18-4310-9b65-8737194afadf	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	Maria Lopez	\N	\N	\N	Av. Siempre Viva 742	40.712800000000000000000000000000	-74.006100000000000000000000000000	0101000020E61000005C2041F1638052C05E4BC8073D5B4440	INACTIVE	ef3568c6-1e65-4bb6-9f80-672f4ff46d21	8.449999999999999000000000000000	\N	2026-09-17 15:31:04.838	2026-09-17 15:31:14.749	2026-09-17 15:31:14.749
accc6e01-1ae5-4245-b48d-b3c411550caa	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	Cliente Cuenca	\N	\N	\N	Cuenca test	-2.900600000000000000000000000000	-79.004499999999990000000000000000	0101000020E61000003F355EBA49C053C08638D6C56D3407C0	INACTIVE	1a8c0c7c-c3fc-4383-99f7-c279fd708d9a	0.000000000000000000000000000000	\N	2026-09-17 19:31:42.458	2026-09-17 19:34:07.308	2026-09-17 19:34:07.307
e2fb8f66-c140-4f19-b6e3-78e940064378	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	pedrito	\N	\N	\N	cuenca	-2.907160000000000000000000000000	-78.986900000000010000000000000000	0101000020E6100000091B9E5E29BF53C036EA211ADD4107C0	INACTIVE	1a8c0c7c-c3fc-4383-99f7-c279fd708d9a	2086.850000000000000000000000000000	\N	2026-09-17 18:17:36.687	2026-09-17 20:25:38.599	2026-09-17 20:25:38.598
60f967a8-d5ed-4b80-a30b-f4eb85f313dd	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	sm0202-2	\N	\N	\N	cuenca	-2.907158000000000000000000000000	-78.986902000000000000000000000000	0101000020E6100000D996016729BF53C02A70B20DDC4107C0	INACTIVE	1a8c0c7c-c3fc-4383-99f7-c279fd708d9a	2086.570000000000000000000000000000	\N	2026-09-17 17:35:38.672	2026-09-17 20:25:40.959	2026-09-17 20:25:40.958
3b15c8c1-e4bf-4196-8c11-9e8bc20246f6	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	sm0203-1	\N	\N	\N	cuenca	-2.907130000000000000000000000000	-78.990015000000000000000000000000	0101000020E61000002AE3DF675CBF53C08BC3995FCD4107C0	INACTIVE	1a8c0c7c-c3fc-4383-99f7-c279fd708d9a	1764.880000000000000000000000000000	\N	2026-09-17 17:34:46.147	2026-09-17 20:25:42.787	2026-09-17 20:25:42.786
\.


--
-- Data for Name: dio_ports; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.dio_ports (id, "dioId", number, label, status, "connectorType", notes) FROM stdin;
\.


--
-- Data for Name: dios; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.dios (id, code, name, "projectId", "popId", "rackId", capacity, "usedPorts", status, description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: ducts; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.ducts (id, code, name, "projectId", geometry, type, "diameterMm", "ductCount", "subductCount", capacity, "occupiedCapacity", status, "installationType", "startNodeType", "startNodeId", "endNodeType", "endNodeId", notes, "calculatedLengthMeters", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: equipment_manufacturers; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.equipment_manufacturers (id, name, code, description, active) FROM stdin;
\.


--
-- Data for Name: equipment_models; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.equipment_models (id, "manufacturerId", name, type, description, metadata, active) FROM stdin;
\.


--
-- Data for Name: fiber_reservations; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.fiber_reservations (id, "fiberId", "projectId", reason, "reservedFor", "startsAt", "expiresAt", status, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: fiber_segments; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.fiber_segments (id, "fiberId", "startTerminationId", "endTerminationId", "lengthMeters", "calculatedLossDb", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: fiber_tubes; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.fiber_tubes (id, "cableId", number, color, label, "fiberCapacity", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: fibers; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.fibers (id, "cableId", "tubeId", number, "numberInTube", color, label, status, "attenuationDbPerKm", description, version, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: infrastructure_relations; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.infrastructure_relations (id, "sourceType", "sourceId", "targetType", "targetId", "relationType", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: network_nodes; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.network_nodes (id, "projectId", code, name, "nodeType", status, description, latitude, longitude, geometry, "regionId", "zoneId", "parentNodeId", "externalReference", metadata, "locationSource", "accuracyMeters", version, "createdAt", "updatedAt", "deletedAt") FROM stdin;
960dffac-69a2-4c40-bce9-7349baba6c53	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789669651262	TEST-VER	POLE	PLANNED	\N	40.700000000000000000000000000000	-73.989999999999990000000000000000	0101000020E61000008FC2F5285C7F52C09A99999999594440	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 18:27:31.266	2026-09-17 18:30:14.524	2026-09-17 18:30:14.523
b24e5e80-9859-42d1-9d0a-8cddb18ee90c	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789668720340	GS1	NAP	PLANNED	\N	-2.907160000000000000000000000000	-78.986900000000010000000000000000	0101000020E6100000091B9E5E29BF53C036EA211ADD4107C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 18:12:00.343	2026-09-17 19:33:52.789	\N
4198dc63-8e1a-482f-8b9b-f6f0e6d61ca2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789681098553	POS-1	POLE	PLANNED	\N	-2.903633220265291000000000000000	-78.993944055905730000000000000000	0101000020E6100000CC8A87C79CBF53C0DFF2C40DA43A07C0	\N	\N	\N	\N	\N	MANUAL	\N	1	2026-09-17 21:38:18.563	2026-09-17 21:38:18.563	\N
8565d15f-25f6-4281-8012-315a51ff4e9f	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789668868079	GS2	POP	PLANNED	\N	-2.907130000000000000000000000000	-78.990010000000000000000000000000	0101000020E6100000A12DE7525CBF53C08BC3995FCD4107C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 18:14:28.081	2026-09-17 19:33:52.858	\N
2c88a75c-b73b-48c7-aa07-5f66d4777456	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789673476925	NODO-CUENCA	NAP	PLANNED	\N	-2.900600000000000000000000000000	-79.004499999999990000000000000000	0101000020E61000003F355EBA49C053C08638D6C56D3407C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 19:31:16.942	2026-09-17 19:34:07.357	2026-09-17 19:34:07.356
50f92861-a40d-4826-b9c7-4fe1fd04cf3a	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789674458412	NAP-FIX-CHECK	NAP	PLANNED	\N	-2.905752045435790000000000000000	-78.988918839950670000000000000000	0101000020E610000021FF3E724ABF53C06074ABEDFA3E07C0	\N	\N	\N	\N	\N	MANUAL	\N	2	2026-09-17 19:47:38.423	2026-09-17 19:48:12.999	2026-09-17 19:48:12.998
b541b654-0723-4382-a5d6-a4f0224f727d	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789674639958	POSTE-DEBUG	POLE	PLANNED	\N	-2.906000000000000000000000000000	-78.988000000000000000000000000000	0101000020E6100000AC1C5A643BBF53C0736891ED7C3F07C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 19:50:39.96	2026-09-17 19:53:06.466	2026-09-17 19:53:06.464
4ff2b81c-1072-4a01-99fa-e96318e326c2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789677378501	POSTE-VISUAL	POLE	PLANNED	\N	-2.905500000000000000000000000000	-78.988500000000000000000000000000	0101000020E61000002506819543BF53C05839B4C8763E07C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 20:36:18.504	2026-09-17 20:41:13.02	2026-09-17 20:41:13.017
50675246-631b-4526-8104-826ea9acc9ac	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789677378597	OLT-VISUAL	OLT	PLANNED	\N	-2.905200000000000000000000000000	-78.988200000000010000000000000000	0101000020E6100000107A36AB3EBF53C0AEB6627FD93D07C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 20:36:18.6	2026-09-17 20:41:17.856	2026-09-17 20:41:17.855
fcacb0a2-776a-4d32-9a1f-5b02225ffda2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789676864584	SM-0978-1	NAP	ACTIVE	\N	-2.905766436833858000000000000000	-78.987810636924370000000000000000	0101000020E6100000CA0E1B4A38BF53C080204079023F07C0	\N	\N	\N	\N	\N	MANUAL	\N	3	2026-09-17 20:27:44.588	2026-09-17 20:41:54.249	2026-09-17 20:41:54.248
57776035-5e94-4d8c-8853-6f54daf98f2b	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	NODE-1789677307720	OLT-GS	OLT	PLANNED	\N	-2.910480000000000000000000000000	-78.987990000000000000000000000000	0101000020E61000009AB1683A3BBF53C0F14BFDBCA94807C0	\N	\N	\N	\N	\N	\N	\N	2	2026-09-17 20:35:07.727	2026-09-17 20:42:53.997	2026-09-17 20:42:53.996
\.


--
-- Data for Name: odf_ports; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.odf_ports (id, "odfId", number, label, status, "connectorType", notes) FROM stdin;
2b5118c0-dc07-479d-85c3-633a38093a34	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	2	\N	FREE	\N	\N
9894d779-7d20-4dab-a136-6a0d8ee8ad6d	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	3	\N	FREE	\N	\N
08b02d9f-3dc6-480e-a320-4b941740efa2	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	4	\N	FREE	\N	\N
6a0a8711-6645-4615-990e-7ed066d5f1a0	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	5	\N	FREE	\N	\N
92a88f63-52ec-46b7-9033-39e7b1e21a04	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	6	\N	FREE	\N	\N
b02e98e5-9bfd-4ae1-baab-17f916a25e8c	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	7	\N	FREE	\N	\N
e8abe10b-e7b8-430b-ac4c-1f929e79356e	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	8	\N	FREE	\N	\N
3dbafc2e-37ac-4426-bfeb-1481d40d5a12	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	9	\N	FREE	\N	\N
18448ebc-2fe7-4d46-af5d-04063f58e0fc	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	10	\N	FREE	\N	\N
4a9e6763-bd50-47a6-bcba-e3a313eeb3d4	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	11	\N	FREE	\N	\N
837eeb2b-8f8d-4455-a020-1298263b2abb	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	12	\N	FREE	\N	\N
4c01f3b9-1ebc-4cda-a9a7-ed3fa7032fde	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	13	\N	FREE	\N	\N
1e83a8bf-7f8e-4c73-a8b6-f0a900b7c2d6	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	14	\N	FREE	\N	\N
7bfcdedd-267e-4065-ae92-df54ce3ac735	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	15	\N	FREE	\N	\N
e5d1ec3a-ac56-4d32-9055-46402ff5bc7b	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	16	\N	FREE	\N	\N
688a0ecb-dee2-4140-a6aa-b5e26f6b6f91	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	17	\N	FREE	\N	\N
2ba6b057-15b1-435a-83aa-32a8cef41ecc	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	18	\N	FREE	\N	\N
182a7d41-38a9-4c16-ac0e-2ced9b9fea9d	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	19	\N	FREE	\N	\N
d0d0dafc-d0d1-49f9-987c-b87db11b2518	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	20	\N	FREE	\N	\N
91dc4cfa-bb36-4ce2-8d8f-4ccc6accf0fb	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	21	\N	FREE	\N	\N
48a05f65-da4f-4274-b958-acb059d6ee48	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	22	\N	FREE	\N	\N
419cf2f1-0464-4425-843b-5ed3df73e52f	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	23	\N	FREE	\N	\N
5af4c7d1-b3da-4186-94c9-7d67759b2681	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	24	\N	FREE	\N	\N
e4c612fc-c92f-42f1-aa2b-3c3a07c5f9a7	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	25	\N	FREE	\N	\N
c95cb69e-f5ff-40f8-a136-eb5dc913b08e	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	26	\N	FREE	\N	\N
2c5f95a3-eae8-4548-a82f-edbd1cd7624d	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	27	\N	FREE	\N	\N
398aa513-4780-4ffd-ae30-c192d703b1ff	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	28	\N	FREE	\N	\N
9287f732-0f5a-4aea-95e1-87597cc8cf6d	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	29	\N	FREE	\N	\N
0bf0f8f4-19f5-442a-b110-e01d2bd0f33d	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	30	\N	FREE	\N	\N
152ed7f6-b3cc-422f-aa7f-ff16a35d3332	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	31	\N	FREE	\N	\N
79d1a1c3-a6fe-4528-a394-6e7c0181c44f	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	32	\N	FREE	\N	\N
c852d5cb-b7b7-4687-87c8-1bf68a553737	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	33	\N	FREE	\N	\N
7cfd7dff-a73e-4e20-8604-f8691c3342b9	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	34	\N	FREE	\N	\N
c3d7447a-5975-47f2-836b-ebfee5c64420	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	35	\N	FREE	\N	\N
941bd7d4-d207-4cea-b1fd-8f2fc838505c	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	36	\N	FREE	\N	\N
ea8e00c1-dc26-4e0a-8aaf-c0369f7896da	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	37	\N	FREE	\N	\N
276647b2-2e35-4383-a933-bff70fe398d8	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	38	\N	FREE	\N	\N
f2d6dbee-0d85-43f1-8e66-5a34ff1ab392	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	39	\N	FREE	\N	\N
b7d66351-fca0-4d5c-b680-672c6db5d7f8	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	40	\N	FREE	\N	\N
2ff547e0-0237-4dfb-b746-c4613da3cf28	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	41	\N	FREE	\N	\N
2471523e-4c28-49a3-8595-23f4541a08dc	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	42	\N	FREE	\N	\N
7d8a31d2-2461-4002-9137-b7703890ce8f	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	43	\N	FREE	\N	\N
052a5758-2183-4cf8-b06a-a79e18ef7ca6	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	44	\N	FREE	\N	\N
2b6b4184-4665-4a8b-934c-5c5a91606517	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	45	\N	FREE	\N	\N
9103438c-434b-4444-8025-62112dfd2ea5	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	46	\N	FREE	\N	\N
7ef5acf1-ba0b-4b18-8be6-c4389ff85b92	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	47	\N	FREE	\N	\N
b50c5b00-1a46-4ada-8465-182a7d5e6467	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	48	\N	FREE	\N	\N
8d15662d-1cd1-466c-98b6-5ee9637a2cb7	1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	1	\N	USED	\N	\N
60fcdfbe-f227-4981-b2c9-39add28dbc1a	e1c83094-43e6-4070-977b-19584e539471	1	\N	FREE	\N	\N
aa75764a-5aa5-434f-9339-fe0c08c6df7e	e1c83094-43e6-4070-977b-19584e539471	2	\N	FREE	\N	\N
2bb3e97b-fe88-48ae-bb4b-5c41a2948fab	e1c83094-43e6-4070-977b-19584e539471	3	\N	FREE	\N	\N
5382509d-9ca7-4656-b9ad-444617792d2c	e1c83094-43e6-4070-977b-19584e539471	4	\N	FREE	\N	\N
bf68bc48-2ad1-424e-b195-1a2c43d27e9e	e1c83094-43e6-4070-977b-19584e539471	5	\N	FREE	\N	\N
a9caf151-abc5-4d33-8c45-3de1c0bde93f	e1c83094-43e6-4070-977b-19584e539471	6	\N	FREE	\N	\N
871b5f16-e23e-4edc-9b22-4b8453624263	e1c83094-43e6-4070-977b-19584e539471	7	\N	FREE	\N	\N
173e8d0e-1a9a-4b73-b257-c31dc5750b04	e1c83094-43e6-4070-977b-19584e539471	8	\N	FREE	\N	\N
22b6f9aa-beb3-4a3f-898e-b68cfa0b0605	e1c83094-43e6-4070-977b-19584e539471	9	\N	FREE	\N	\N
5d5f2202-54dd-40f1-8b28-20cc3c1b5b2b	e1c83094-43e6-4070-977b-19584e539471	10	\N	FREE	\N	\N
440baf43-a469-4598-8d60-70f8ae298b59	e1c83094-43e6-4070-977b-19584e539471	11	\N	FREE	\N	\N
1777b373-97f7-463f-96ef-355873aed4f5	e1c83094-43e6-4070-977b-19584e539471	12	\N	FREE	\N	\N
7bac1f05-3788-4883-8c08-abdcc3e0782c	e1c83094-43e6-4070-977b-19584e539471	13	\N	FREE	\N	\N
a87e6472-82f6-4239-a776-21fff1465f82	e1c83094-43e6-4070-977b-19584e539471	14	\N	FREE	\N	\N
8966f56e-b92b-429d-8495-5346a1b5d42a	e1c83094-43e6-4070-977b-19584e539471	15	\N	FREE	\N	\N
717c041d-fef3-44ee-8555-669debfac0f2	e1c83094-43e6-4070-977b-19584e539471	16	\N	FREE	\N	\N
7adfdf39-18d9-4a7e-a524-c933825650ef	e1c83094-43e6-4070-977b-19584e539471	17	\N	FREE	\N	\N
1a871070-9df8-400a-b9ad-42e1c46bbd9b	e1c83094-43e6-4070-977b-19584e539471	18	\N	FREE	\N	\N
07c9abfe-3d88-4596-8db8-46cedf36f43f	e1c83094-43e6-4070-977b-19584e539471	19	\N	FREE	\N	\N
a3d6bb10-c728-4ab1-b169-fe4ec19c076f	e1c83094-43e6-4070-977b-19584e539471	20	\N	FREE	\N	\N
1c8e8c18-114c-4354-98c8-2ac7f7004558	e1c83094-43e6-4070-977b-19584e539471	21	\N	FREE	\N	\N
beafef96-c0cf-42e2-9742-8f0838a88704	e1c83094-43e6-4070-977b-19584e539471	22	\N	FREE	\N	\N
637e9536-b0ab-4708-9418-28feeb8926fe	e1c83094-43e6-4070-977b-19584e539471	23	\N	FREE	\N	\N
154fce52-b9fa-4d56-acb0-a5bca122ac34	e1c83094-43e6-4070-977b-19584e539471	24	\N	FREE	\N	\N
\.


--
-- Data for Name: odfs; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.odfs (id, code, name, "projectId", latitude, longitude, geometry, capacity, "usedPorts", status, description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1c88eb13-e3a1-4bd1-adfb-d25f1089cd64	ODF-1	ODF-1	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	-2.900432600097318000000000000000	-78.989689938606190000000000000000	0101000020E61000009BDF771457BF53C0A05CCD01163407C0	48	1	ACTIVE	\N	2026-09-18 22:44:56.704	2026-09-18 22:45:23.984	\N
e1c83094-43e6-4070-977b-19584e539471	ODF-2	ODF-2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	-2.801111206116255000000000000000	-78.990502699520320000000000000000	0101000020E610000087426F6564BF53C0D3D3F5FDAC6806C0	24	0	ACTIVE	\N	2026-09-21 14:21:39.922	2026-09-21 14:21:59.923	\N
\.


--
-- Data for Name: olt_cards; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.olt_cards (id, "slotId", "manufacturerId", "equipmentModelId", code, name, "serialNumber", "cardType", status, "ponPortCapacity", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: olt_shelves; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.olt_shelves (id, "oltId", number, name, "position", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: olt_slots; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.olt_slots (id, "shelfId", number, name, "slotType", status, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: olt_templates; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.olt_templates (id, name, "manufacturerId", "equipmentModelId", "shelfCount", "slotsPerShelf", "defaultCardType", "ponPortsPerCard", "defaultPonType", metadata, active) FROM stdin;
\.


--
-- Data for Name: olts; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.olts (id, code, name, "projectId", "popId", "rackId", manufacturer, model, "serialNumber", "managementIp", "macAddress", "firmwareVersion", "rackPosition", "rackUnits", latitude, longitude, geometry, status, description, "createdAt", "updatedAt", "deletedAt", "odfPortId") FROM stdin;
12ec7a4e-6e8b-48a0-9fca-6b2089c8f423	OLT-3	OLT-3	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-2.901504112368698000000000000000	-78.989861599982790000000000000000	0101000020E610000082DF77E459BF53C01FAABEC9473607C0	ACTIVE	\N	2026-09-18 22:45:23.934	2026-09-18 22:45:23.934	\N	8d15662d-1cd1-466c-98b6-5ee9637a2cb7
\.


--
-- Data for Name: optical_connections; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.optical_connections (id, "sourceTerminationId", "targetTerminationId", "connectionType", "lossDb", status, notes, "spliceMethod", technician, "splicedAt", version, "createdAt", "updatedAt", "deletedAt", "sourceFiberId", "targetFiberId") FROM stdin;
98d4a96a-ee17-424e-a0a3-076dea9fb9cf	9d96295d-628f-4ecc-ab74-d435606b4351	d5938a56-be79-4ed5-8f2b-0b0e9250c894	SPLICE	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 17:47:10.986	2026-09-17 17:47:10.986	\N	\N	\N
a5df7f5c-9130-4c8d-be31-bdb8a97cf5c4	dfbf9e58-fc20-42f4-955a-40955e3b6484	394b0bb2-c117-4f21-ab80-e2e9cca829ad	SPLICE	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 17:51:40.027	2026-09-17 17:51:40.027	\N	\N	\N
1b0b09f4-00ad-4b3d-9f65-ce9c336fb57a	ea8746df-8a52-4954-b59e-903e30c5e105	a8ea6f3e-94e3-476a-92db-87c61c842ce6	SPLICE	0.300000000000000000000000000000	ACTIVE	\N	\N	\N	\N	1	2026-09-17 18:03:35.32	2026-09-17 18:03:35.32	\N	\N	\N
acaa68b0-e862-4d2f-9a78-13c95dda30e0	ed9ba36c-5a59-4827-b03c-7bd930f13436	1782fe1e-2903-4fd9-92db-a8ab1876ce7a	SPLICE	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 18:10:17.924	2026-09-17 18:10:17.924	\N	\N	\N
91a6afe3-eebe-4c27-837b-a186df557ea2	92974c9f-481e-45e7-932c-d6ea36ca3bfb	3a6e69bb-c4f3-4c4a-b33d-c1b88ca5c022	SPLITTER_LINK	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 20:24:55.818	2026-09-17 20:24:55.818	\N	\N	\N
19f3b471-c38e-4d86-a0ed-f854b82a5afe	b26f23a8-37e7-43b0-812b-34a368d5448e	61c3854c-dbea-4d02-90f0-142b3eea9bab	CONNECTOR	\N	REMOVED	\N	\N	\N	\N	1	2026-09-17 18:15:24.995	2026-09-17 20:25:05.942	2026-09-17 20:25:05.941	\N	\N
405658b6-40c8-42a6-b820-71ce6f365877	4aa4883d-3fc8-4db6-8724-97f32634745b	42b88204-e82b-4c92-b59a-6729ad9b8efb	SPLITTER_LINK	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 20:25:30.922	2026-09-17 20:25:30.922	\N	\N	\N
9ccce792-dab9-40d0-80b5-d143d0836b9f	5b54d7a5-cc29-4bff-a5fe-2c35ce364168	2bcef076-81c8-43d7-972e-6a4a6e363185	SPLICE	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 20:37:44.656	2026-09-17 20:37:44.656	\N	\N	\N
ef382f4b-0f14-4809-91f5-2e10d29e2e19	e39b0b79-5ede-4b37-a2ce-8240246cb569	0bb9a0b7-15ca-44ec-8df6-22515a895019	SPLITTER_LINK	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-17 20:48:50.798	2026-09-17 20:48:50.798	\N	\N	\N
640074f0-78d1-423f-af21-e12cf1dcd897	26e60e89-f42a-49ec-aaa9-b7905ad8cb21	6fcfe318-0c57-4269-a4f1-2d9fa626b593	CONNECTOR	\N	ACTIVE	\N	\N	\N	\N	1	2026-09-18 03:52:55.259	2026-09-18 03:52:55.259	\N	\N	\N
\.


--
-- Data for Name: optical_connectors; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.optical_connectors (id, type, "insertionLossDb", status, "containerType", "containerId") FROM stdin;
\.


--
-- Data for Name: optical_terminations; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.optical_terminations (id, type, "entityType", "entityId", "portIdentifier", "boxId", "dioId", "oltId", metadata, "createdAt", "odfId") FROM stdin;
9d96295d-628f-4ecc-ab74-d435606b4351	BOX_PORT	BOX_PORT	97011940-e41a-41b7-962e-f4e351073d85	\N	b966e576-01c0-47c0-afd9-25920082fcc5	\N	\N	\N	2026-09-17 17:47:10.962	\N
d5938a56-be79-4ed5-8f2b-0b0e9250c894	SPLITTER_INPUT	SPLITTER_INPUT	32e7ac49-b2e6-4ce3-b704-b641eded64b5	\N	b966e576-01c0-47c0-afd9-25920082fcc5	\N	\N	\N	2026-09-17 17:47:10.969	\N
482399ba-6d2b-4d61-832b-425c76570bc8	SPLITTER_OUTPUT	SPLITTER_OUTPUT	cfa9c7e1-33d6-4360-96c8-96eabd92fd77	\N	b966e576-01c0-47c0-afd9-25920082fcc5	\N	\N	\N	2026-09-17 17:47:23.461	\N
dfbf9e58-fc20-42f4-955a-40955e3b6484	BOX_PORT	BOX_PORT	8fdca5ca-d929-41e4-8f53-4997155232e3	\N	2860dcfb-62bc-469e-b704-f771f9091ba6	\N	\N	\N	2026-09-17 17:51:39.993	\N
394b0bb2-c117-4f21-ab80-e2e9cca829ad	SPLITTER_INPUT	SPLITTER_INPUT	98bfb25a-4695-47ba-8305-2f8e25a666a4	\N	2860dcfb-62bc-469e-b704-f771f9091ba6	\N	\N	\N	2026-09-17 17:51:40.006	\N
ea8746df-8a52-4954-b59e-903e30c5e105	BOX_PORT	BOX_PORT	daa1cb63-6b30-4871-b996-98fd49bb4e8b	\N	e82e697a-3c81-45d7-ad64-7e65be0a7077	\N	\N	\N	2026-09-17 18:03:35.286	\N
a8ea6f3e-94e3-476a-92db-87c61c842ce6	SPLITTER_INPUT	SPLITTER_INPUT	db0e4660-b673-48ea-a35e-005bb0311352	\N	e82e697a-3c81-45d7-ad64-7e65be0a7077	\N	\N	\N	2026-09-17 18:03:35.3	\N
ed9ba36c-5a59-4827-b03c-7bd930f13436	SPLITTER_OUTPUT	SPLITTER_OUTPUT	77064871-8038-454f-b29d-901a07c1676b	\N	4e18a2f2-6ebf-486c-8cd3-05bc1544f182	\N	\N	\N	2026-09-17 18:10:17.888	\N
1782fe1e-2903-4fd9-92db-a8ab1876ce7a	SPLITTER_OUTPUT	SPLITTER_OUTPUT	a9f0d2c4-c91b-4d29-aa88-3831f6ccec6b	\N	4e18a2f2-6ebf-486c-8cd3-05bc1544f182	\N	\N	\N	2026-09-17 18:10:17.9	\N
b26f23a8-37e7-43b0-812b-34a368d5448e	SPLITTER_INPUT	SPLITTER_INPUT	59d5cb67-b5b8-44b7-a69a-1709d4133736	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 18:15:24.972	\N
61c3854c-dbea-4d02-90f0-142b3eea9bab	SPLITTER_OUTPUT	SPLITTER_OUTPUT	3dcc1241-f1a6-4a17-89d7-20c8f9befefa	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 18:15:24.983	\N
49703071-1211-4e4f-ab1e-6ba004c5c201	SPLITTER_OUTPUT	SPLITTER_OUTPUT	b2ed1afe-e257-402b-93fd-e25ca8dc1692	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 20:13:50.924	\N
92974c9f-481e-45e7-932c-d6ea36ca3bfb	SPLITTER_OUTPUT	SPLITTER_OUTPUT	b91375ca-35c9-4bac-8a35-996010925b5e	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 20:24:55.796	\N
3a6e69bb-c4f3-4c4a-b33d-c1b88ca5c022	SPLITTER_OUTPUT	SPLITTER_OUTPUT	d1c92f88-313a-49aa-83a2-9d9ffd3a2869	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 20:24:55.802	\N
4aa4883d-3fc8-4db6-8724-97f32634745b	SPLITTER_OUTPUT	SPLITTER_OUTPUT	6dbcc5ff-dae6-4a99-b7e1-5c87a8e7a9a5	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 20:25:30.908	\N
42b88204-e82b-4c92-b59a-6729ad9b8efb	SPLITTER_OUTPUT	SPLITTER_OUTPUT	c89a07cd-af8c-46a5-ab41-3974d55a39f7	\N	a9001657-727c-4d0d-b9f4-ec8745831c71	\N	\N	\N	2026-09-17 20:25:30.912	\N
5b54d7a5-cc29-4bff-a5fe-2c35ce364168	SPLITTER_OUTPUT	SPLITTER_OUTPUT	2f1e54f4-e0e4-456b-82e3-1fee8deee270	\N	b0066f77-9a4c-4df8-afcf-cd3e1aa579f8	\N	\N	\N	2026-09-17 20:37:44.639	\N
2bcef076-81c8-43d7-972e-6a4a6e363185	SPLITTER_INPUT	SPLITTER_INPUT	0b912faf-852e-4469-88e8-1f7edce34644	\N	b0066f77-9a4c-4df8-afcf-cd3e1aa579f8	\N	\N	\N	2026-09-17 20:37:44.647	\N
e39b0b79-5ede-4b37-a2ce-8240246cb569	SPLITTER_INPUT	SPLITTER_INPUT	0c0e7b44-19fb-4edc-905b-b4e924857197	\N	6c9401cb-37ff-460c-bae2-dbed3e67c6d9	\N	\N	\N	2026-09-17 20:48:50.751	\N
0bb9a0b7-15ca-44ec-8df6-22515a895019	SPLITTER_OUTPUT	SPLITTER_OUTPUT	948bbcee-313c-4a46-88d3-15ec1f7b8970	\N	6c9401cb-37ff-460c-bae2-dbed3e67c6d9	\N	\N	\N	2026-09-17 20:48:50.764	\N
26e60e89-f42a-49ec-aaa9-b7905ad8cb21	BOX_PORT	BOX_PORT	7adfd6fd-8ede-4dec-af29-eab4181bcd7c	\N	0d67c559-0303-432a-8803-1df4f144c2cd	\N	\N	\N	2026-09-18 03:52:55.231	\N
6fcfe318-0c57-4269-a4f1-2d9fa626b593	BOX_PORT	BOX_PORT	13c6b069-2321-48be-abc0-b1b7d76ad1cd	\N	0d67c559-0303-432a-8803-1df4f144c2cd	\N	\N	\N	2026-09-18 03:52:55.24	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.permissions (id, name, description, "createdAt", "updatedAt") FROM stdin;
2d19617f-801e-45d7-a137-ebe7f9314f38	network.read	\N	2026-09-17 15:14:24.068	2026-09-17 15:14:24.068
d04e8178-4ef5-4f54-96c0-140139ded7cb	network.write	\N	2026-09-17 15:14:24.171	2026-09-17 15:14:24.171
ae4d73f4-cd58-454e-9bf2-f1c31e983374	network.delete	\N	2026-09-17 15:14:24.177	2026-09-17 15:14:24.177
d28819c4-4760-4e79-882b-5c5e0d246e4b	clients.read	\N	2026-09-17 15:14:24.182	2026-09-17 15:14:24.182
f5c93a3d-5e35-440b-a618-f9dce7117c1d	clients.write	\N	2026-09-17 15:14:24.189	2026-09-17 15:14:24.189
64aaa3d2-d63c-4f7d-9b6f-e91e4e630c0e	users.manage	\N	2026-09-17 15:14:24.195	2026-09-17 15:14:24.195
\.


--
-- Data for Name: poles; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.poles (id, code, name, "projectId", latitude, longitude, geometry, material, height, owner, status, notes, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: pon_ports; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.pon_ports (id, "cardId", "slotId", "oltId", number, label, "ponType", status, "maxOnus", "configuredOnus", "txPower", "wavelengthDown", "wavelengthUp", "externalIdentifier", notes, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: pops; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.pops (id, code, name, "projectId", address, latitude, longitude, geometry, status, description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.projects (id, code, name, description, status, "centerLatitude", "centerLongitude", "defaultZoom", "createdAt", "updatedAt", "deletedAt") FROM stdin;
c4906e4b-6908-4dc6-b26d-f2f68576c3e2	DEF-001	Proyecto por Defecto	\N	ACTIVE	0.000000000000000000000000000000	0.000000000000000000000000000000	15	2026-09-17 15:26:46.921	2026-09-17 15:26:46.921	\N
\.


--
-- Data for Name: racks; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.racks (id, code, name, "projectId", "popId", "rackUnits", "usedUnits", status, description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.regions (id, code, name, description, "projectId", geometry, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
d8a503f4-2762-4d1e-b7e3-357cf9772363	ADMIN	\N	2026-09-17 15:14:24.203	2026-09-17 15:14:24.203
9f45677d-9094-40c2-8050-0810eea57310	OPERATOR	\N	2026-09-17 15:14:24.229	2026-09-17 15:14:24.229
243fe513-4f60-46d5-a94b-7f41403cea8f	VIEWER	\N	2026-09-17 15:14:24.238	2026-09-17 15:14:24.238
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: splitter_ports; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.splitter_ports (id, "splitterId", "portType", number, label, status, "lossDb", "createdAt") FROM stdin;
cfa9c7e1-33d6-4360-96c8-96eabd92fd77	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	1	\N	FREE	\N	2026-09-17 17:46:58.65
3d9eb73a-0407-453f-bfa2-946dfcfaaf50	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	2	\N	FREE	\N	2026-09-17 17:46:58.65
cd27b213-5d03-4a9a-b78b-a1a5a2373893	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	3	\N	FREE	\N	2026-09-17 17:46:58.65
e78c0ddc-2195-4333-a300-10e9ace8153d	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	4	\N	FREE	\N	2026-09-17 17:46:58.65
8d5feb75-6dc0-4f1e-9a0b-0e9280dd165a	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	5	\N	FREE	\N	2026-09-17 17:46:58.65
1757894c-82ef-48d6-b176-e99887498e5e	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	6	\N	FREE	\N	2026-09-17 17:46:58.65
d4c40e1c-5b58-418a-b355-ae5da9100f96	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	7	\N	FREE	\N	2026-09-17 17:46:58.65
58010635-28a1-4476-81e7-fcc1f315e6f6	efa41b29-486e-4e02-b79b-50f181b99aa8	OUTPUT	8	\N	FREE	\N	2026-09-17 17:46:58.65
32e7ac49-b2e6-4ce3-b704-b641eded64b5	efa41b29-486e-4e02-b79b-50f181b99aa8	INPUT	1	\N	USED	\N	2026-09-17 17:46:58.65
36b421f0-f2b1-46d6-8f16-7d9fb086b521	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	1	\N	FREE	\N	2026-09-17 17:51:03.304
38f9ab48-3ee2-4fb6-94f2-438bac673845	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	2	\N	FREE	\N	2026-09-17 17:51:03.304
bc28c1d7-da1a-4a7b-a779-4260e5369d57	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	3	\N	FREE	\N	2026-09-17 17:51:03.304
bbc8ec37-4186-4993-9c2b-037a1f049fea	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	4	\N	FREE	\N	2026-09-17 17:51:03.304
78126f5e-0413-49e2-a11a-b6732b32004d	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	5	\N	FREE	\N	2026-09-17 17:51:03.304
dd29e397-8745-4a0c-8ae2-ab9b4c003e3b	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	6	\N	FREE	\N	2026-09-17 17:51:03.304
1c0d079c-012d-414a-869b-ec007beb012f	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	7	\N	FREE	\N	2026-09-17 17:51:03.304
5d87253c-234f-4890-9f3c-b70d7dbfded3	ef952c3d-c4d4-4b95-b180-708d541c0622	OUTPUT	8	\N	FREE	\N	2026-09-17 17:51:03.304
98bfb25a-4695-47ba-8305-2f8e25a666a4	ef952c3d-c4d4-4b95-b180-708d541c0622	INPUT	1	\N	USED	\N	2026-09-17 17:51:03.304
419f79fc-2fa3-4463-8d4c-11aeb1687470	ffb82138-07a5-45ef-9ccf-1345c866d060	INPUT	1	\N	FREE	\N	2026-09-17 17:58:17.229
0e06437f-0640-4ff1-a40a-a117cc9bcd6d	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	1	\N	FREE	\N	2026-09-17 17:58:17.229
2f7cbd8f-9869-4c62-87de-e62c61cdfe64	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	2	\N	FREE	\N	2026-09-17 17:58:17.229
3af0725a-38b7-425a-9320-b285343d538e	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	3	\N	FREE	\N	2026-09-17 17:58:17.229
cfd68e2b-6852-45ff-a4cb-1c5d98ad0f1b	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	4	\N	FREE	\N	2026-09-17 17:58:17.229
dcee040d-5509-4790-afc2-e3888669455a	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	5	\N	FREE	\N	2026-09-17 17:58:17.229
b20c9678-c9ea-400d-bbe4-afbb92924ce5	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	6	\N	FREE	\N	2026-09-17 17:58:17.229
dbe78e59-ba92-4bad-8c92-54d9ce17688c	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	7	\N	FREE	\N	2026-09-17 17:58:17.229
ec5fdbf9-9f0b-4c0c-bc82-5216cbd50b17	ffb82138-07a5-45ef-9ccf-1345c866d060	OUTPUT	8	\N	FREE	\N	2026-09-17 17:58:17.229
18d74343-8f11-41de-a15e-e54cf5debde8	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	1	\N	FREE	\N	2026-09-17 18:03:35.059
a87f6767-2b48-48a0-83a4-067d3fa91997	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	2	\N	FREE	\N	2026-09-17 18:03:35.059
eb984eee-7338-4219-9cb4-152639d4bc9c	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	3	\N	FREE	\N	2026-09-17 18:03:35.059
1cfe47b2-2628-4032-8f39-9e6962cd5034	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	4	\N	FREE	\N	2026-09-17 18:03:35.059
fe4fe4a6-e549-455f-9109-cc1497e1310f	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	5	\N	FREE	\N	2026-09-17 18:03:35.059
f4ecd9b5-e613-47ab-b48d-09861ef138e5	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	6	\N	FREE	\N	2026-09-17 18:03:35.059
498b2358-5a6e-4364-be18-9adae0729575	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	7	\N	FREE	\N	2026-09-17 18:03:35.059
07f943b7-b1c6-4a88-87ef-be3b11ffe0a6	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	OUTPUT	8	\N	FREE	\N	2026-09-17 18:03:35.059
db0e4660-b673-48ea-a35e-005bb0311352	a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	INPUT	1	\N	USED	\N	2026-09-17 18:03:35.059
b92c9ee2-2b54-4f51-9ae5-5d554b88d885	83b7f350-615b-4f56-8e85-421b75aa4766	INPUT	1	\N	FREE	\N	2026-09-17 18:09:36.218
18d58ba1-2518-4ed0-95e2-b915e623f104	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	3	\N	FREE	\N	2026-09-17 18:09:36.218
a097c533-ed62-4a8e-93c3-697eedfcb6ab	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	4	\N	FREE	\N	2026-09-17 18:09:36.218
21d51988-55cb-4e79-a82c-1881e1a36f53	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	5	\N	FREE	\N	2026-09-17 18:09:36.218
353d6af7-525d-4ff4-a753-c83b065caa89	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	6	\N	FREE	\N	2026-09-17 18:09:36.218
3c5966d5-fbab-4395-9abb-e7d7bef8acdd	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	7	\N	FREE	\N	2026-09-17 18:09:36.218
de701ff8-205a-4e7e-99af-c79e8e0cf581	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	8	\N	FREE	\N	2026-09-17 18:09:36.218
77064871-8038-454f-b29d-901a07c1676b	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	1	\N	USED	\N	2026-09-17 18:09:36.218
a9f0d2c4-c91b-4d29-aa88-3831f6ccec6b	83b7f350-615b-4f56-8e85-421b75aa4766	OUTPUT	2	\N	USED	\N	2026-09-17 18:09:36.218
d44f502b-be0d-415a-8ef6-3e02b1651432	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	4	\N	FREE	\N	2026-09-17 18:10:56.146
b2ed1afe-e257-402b-93fd-e25ca8dc1692	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	6	\N	FREE	\N	2026-09-17 18:10:56.146
df4c9e91-8649-460c-a37c-e7f77fe2643f	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	7	\N	FREE	\N	2026-09-17 18:10:56.146
28bc7425-d86c-4573-93bc-de0070af1516	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	8	\N	FREE	\N	2026-09-17 18:10:56.146
d6767089-c5a5-4b28-a84e-c98f5c01535b	28a0694f-261f-4af7-bebf-9efd7fb4e619	INPUT	1	\N	FREE	\N	2026-09-17 18:14:42.424
fdcc7c26-f1b9-41fc-b59c-b09fbbbf6237	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	1	\N	FREE	\N	2026-09-17 18:14:42.424
9c16e236-dae0-4210-b269-c15e9b3d0f58	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	2	\N	FREE	\N	2026-09-17 18:14:42.424
ed829310-4a5f-4ce5-919c-c3656f2e30a9	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	3	\N	FREE	\N	2026-09-17 18:14:42.424
a71a627b-4999-4625-afc1-896671651893	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	4	\N	FREE	\N	2026-09-17 18:14:42.424
cef5415f-b86d-442d-8a0f-23c5bda37cc5	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	5	\N	FREE	\N	2026-09-17 18:14:42.424
fcd9d609-4874-4c6d-bba1-7b9b093c16b4	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	6	\N	FREE	\N	2026-09-17 18:14:42.424
6dbcc5ff-dae6-4a99-b7e1-5c87a8e7a9a5	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	5	\N	USED	\N	2026-09-17 18:10:56.146
b91375ca-35c9-4bac-8a35-996010925b5e	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	2	\N	USED	\N	2026-09-17 18:10:56.146
59d5cb67-b5b8-44b7-a69a-1709d4133736	cf531438-490d-4a8e-af0b-e0e87266dd4f	INPUT	1	\N	FREE	\N	2026-09-17 18:10:56.146
989149cd-124b-4808-9452-04187a54b7c9	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	7	\N	FREE	\N	2026-09-17 18:14:42.424
d23f21c8-fce8-4f35-863e-d622e93e2dfa	28a0694f-261f-4af7-bebf-9efd7fb4e619	OUTPUT	8	\N	FREE	\N	2026-09-17 18:14:42.424
e5517d84-c1e1-4fab-92ce-115f385ad0d0	117ab5b4-abd6-4445-a916-d36670df4c26	INPUT	1	\N	FREE	\N	2026-09-17 20:01:02.297
e6e54d1f-ba44-49b6-b204-c94abf29d4c2	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	1	\N	FREE	\N	2026-09-17 20:01:02.297
7a96d925-bde5-4472-ba1b-8aebf37f19d2	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	2	\N	FREE	\N	2026-09-17 20:01:02.297
e396043c-b977-4708-a7e5-619044788a62	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	3	\N	FREE	\N	2026-09-17 20:01:02.297
a0001787-312e-45d4-9c37-22fc956978c5	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	4	\N	FREE	\N	2026-09-17 20:01:02.297
03bf9a9d-5101-49dd-a2ed-3fede44e4a7c	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	5	\N	FREE	\N	2026-09-17 20:01:02.297
7df60130-ac0f-4945-abf9-225f47c049b1	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	6	\N	FREE	\N	2026-09-17 20:01:02.297
58b253c3-a575-4ff8-bd26-e0b9aff1325b	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	7	\N	FREE	\N	2026-09-17 20:01:02.297
b27077b0-d787-484b-9544-b81595430883	117ab5b4-abd6-4445-a916-d36670df4c26	OUTPUT	8	\N	FREE	\N	2026-09-17 20:01:02.297
d663e5ae-885b-460f-b7a0-601e02385570	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	INPUT	1	\N	FREE	\N	2026-09-17 20:08:30.838
4750468e-731e-434c-a816-f6ab6c2e705b	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	1	\N	FREE	\N	2026-09-17 20:08:30.838
03f18538-715e-44d7-a9c9-0ac7ef4702b2	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	2	\N	FREE	\N	2026-09-17 20:08:30.838
ee6f2f99-bd86-422c-99d2-8037d3aa9489	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	3	\N	FREE	\N	2026-09-17 20:08:30.838
1eac7340-05c7-4279-a23d-b312db7a4d8f	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	4	\N	FREE	\N	2026-09-17 20:08:30.838
d1bca35c-a360-4767-8908-3d1836b7bd58	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	5	\N	FREE	\N	2026-09-17 20:08:30.838
191167f4-fa1d-42f1-98cc-da2b139e2238	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	6	\N	FREE	\N	2026-09-17 20:08:30.838
628ef5a5-dd4b-4598-acfb-112648d3e363	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	7	\N	FREE	\N	2026-09-17 20:08:30.838
6e7ad5d8-93ad-4a54-a914-9047d27318a5	8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	OUTPUT	8	\N	FREE	\N	2026-09-17 20:08:30.838
63b0517d-88f6-403c-9ad1-ea878861cb45	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	INPUT	1	\N	FREE	\N	2026-09-17 20:13:56.609
04867dc0-6b32-471f-a1c6-934d6e6e6625	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	1	\N	FREE	\N	2026-09-17 20:13:56.609
f900ed55-ee96-4194-9275-2be5cce6d64c	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	2	\N	FREE	\N	2026-09-17 20:13:56.609
64c268d2-7545-440b-bce4-9537b1f6f257	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	3	\N	FREE	\N	2026-09-17 20:13:56.609
b431bdda-9fb0-4441-aa59-4ac2cc3520ca	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	4	\N	FREE	\N	2026-09-17 20:13:56.609
8c93ed54-19b1-4a10-bfc5-138eaf229063	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	5	\N	FREE	\N	2026-09-17 20:13:56.609
75ffb4f4-c094-40ad-b3e5-9ec456ffec06	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	6	\N	FREE	\N	2026-09-17 20:13:56.609
25a5c8ed-446d-45cd-8db9-ce8bfad8b904	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	7	\N	FREE	\N	2026-09-17 20:13:56.609
7d3ad2e0-8a40-41a7-b29b-f9f58d15647c	1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	OUTPUT	8	\N	FREE	\N	2026-09-17 20:13:56.609
37024230-b6ee-42f0-8160-3af6ca52ccd0	c1f75a55-ae0f-42bc-a38f-edfbbee577c1	INPUT	1	\N	FREE	\N	2026-09-17 20:18:06.431
960a26f8-56e1-44f9-b152-0b635a138933	c1f75a55-ae0f-42bc-a38f-edfbbee577c1	OUTPUT	1	\N	FREE	\N	2026-09-17 20:18:06.431
00f03b53-d2b0-4a94-a847-eedf248758ff	c1f75a55-ae0f-42bc-a38f-edfbbee577c1	OUTPUT	2	\N	FREE	\N	2026-09-17 20:18:06.431
f5341fdd-c3ef-4066-8ade-ff786387555e	c1f75a55-ae0f-42bc-a38f-edfbbee577c1	OUTPUT	3	\N	FREE	\N	2026-09-17 20:18:06.431
d02c7182-82bf-4def-8d3e-76e0131c4853	c1f75a55-ae0f-42bc-a38f-edfbbee577c1	OUTPUT	4	\N	FREE	\N	2026-09-17 20:18:06.431
e737d736-affd-4e7e-9ade-769e10b3bdb6	cecd9c72-af8d-41a4-b9a4-af87b3760d00	INPUT	1	\N	FREE	\N	2026-09-17 20:24:20.435
0e37ea61-c819-4750-bc5a-7b6c162138bc	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	1	\N	FREE	\N	2026-09-17 20:24:20.435
7b9ce750-e17c-4120-a1e6-4c0ae400d78c	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	2	\N	FREE	\N	2026-09-17 20:24:20.435
1db8491a-b150-42ea-9274-a94c6d1fb6b5	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	3	\N	FREE	\N	2026-09-17 20:24:20.435
70884cf8-c550-42e8-868d-161adbc4144a	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	5	\N	FREE	\N	2026-09-17 20:24:20.435
c8d93f32-5126-4d25-abf3-37f26a5e89fb	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	6	\N	FREE	\N	2026-09-17 20:24:20.435
7bbcbab9-dc8f-4265-88f5-e1d035087de6	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	7	\N	FREE	\N	2026-09-17 20:24:20.435
6903d330-093e-4c62-a149-b6202ddf9546	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	8	\N	FREE	\N	2026-09-17 20:24:20.435
d1c92f88-313a-49aa-83a2-9d9ffd3a2869	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	3	\N	USED	\N	2026-09-17 18:10:56.146
3dcc1241-f1a6-4a17-89d7-20c8f9befefa	cf531438-490d-4a8e-af0b-e0e87266dd4f	OUTPUT	1	\N	FREE	\N	2026-09-17 18:10:56.146
c89a07cd-af8c-46a5-ab41-3974d55a39f7	cecd9c72-af8d-41a4-b9a4-af87b3760d00	OUTPUT	4	\N	USED	\N	2026-09-17 20:24:20.435
f84176cc-15d9-4717-b523-9e75bc735e0d	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	1	\N	FREE	\N	2026-09-17 20:36:14.164
7a76c3f8-e14a-491d-92e5-8d7bc9d2476b	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	2	\N	FREE	\N	2026-09-17 20:36:14.164
34da9e5b-d318-4179-a856-bd1d83a632fd	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	3	\N	FREE	\N	2026-09-17 20:36:14.164
d22f7238-ca0f-4281-a495-77fd9763abbd	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	4	\N	FREE	\N	2026-09-17 20:36:14.164
c445fe4f-147b-435f-82be-b9e46b4d2eb3	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	6	\N	FREE	\N	2026-09-17 20:36:14.164
37f38fe8-dbd2-481e-8d8a-30d537b0594f	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	7	\N	FREE	\N	2026-09-17 20:36:14.164
2a303859-7dab-41ca-9ab1-c4f823512e9e	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	8	\N	FREE	\N	2026-09-17 20:36:14.164
0b912faf-852e-4469-88e8-1f7edce34644	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	INPUT	1	\N	USED	\N	2026-09-17 20:36:14.164
2f1e54f4-e0e4-456b-82e3-1fee8deee270	45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	OUTPUT	5	\N	USED	\N	2026-09-17 20:36:14.164
a7918bbd-51bd-43c3-9362-7eb4ed593532	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	1	\N	FREE	\N	2026-09-17 20:42:36.574
2d281324-39fd-4964-a447-666fbd7dfe74	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	2	\N	FREE	\N	2026-09-17 20:42:36.574
aac421f0-be9a-445c-8180-d66c173ab845	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	3	\N	FREE	\N	2026-09-17 20:42:36.574
a3d4dbf3-c6b9-4c3b-9211-e63320ed7ffd	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	4	\N	FREE	\N	2026-09-17 20:42:36.574
1f65620a-0e48-45c7-b851-8138201252c4	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	5	\N	FREE	\N	2026-09-17 20:42:36.574
9932e3f9-f120-409c-b91c-efe42856eaa3	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	6	\N	FREE	\N	2026-09-17 20:42:36.574
63e2c7a3-423e-4422-8841-273860cd983d	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	7	\N	FREE	\N	2026-09-17 20:42:36.574
5a4c4572-082d-4ba6-8f08-db90458e1211	b6ef6790-2466-414f-a646-d4759b1936e2	OUTPUT	8	\N	FREE	\N	2026-09-17 20:42:36.574
f372d8d5-dfb7-4271-9edd-41acd5f4e6cf	8067107b-01d7-4b1e-b1ef-0874c420d613	INPUT	1	\N	FREE	\N	2026-09-17 20:47:16.68
686d76b9-52e0-480b-baab-c086afd9ae00	8067107b-01d7-4b1e-b1ef-0874c420d613	OUTPUT	1	\N	FREE	\N	2026-09-17 20:47:16.68
1bff66af-966e-494e-93ce-54377f77f3e3	8067107b-01d7-4b1e-b1ef-0874c420d613	OUTPUT	3	\N	FREE	\N	2026-09-17 20:47:16.68
40c57e32-5840-4efb-b88b-dba4705c922a	8067107b-01d7-4b1e-b1ef-0874c420d613	OUTPUT	4	\N	FREE	\N	2026-09-17 20:47:16.68
0c0e7b44-19fb-4edc-905b-b4e924857197	b6ef6790-2466-414f-a646-d4759b1936e2	INPUT	1	\N	USED	\N	2026-09-17 20:42:36.574
948bbcee-313c-4a46-88d3-15ec1f7b8970	8067107b-01d7-4b1e-b1ef-0874c420d613	OUTPUT	2	\N	USED	\N	2026-09-17 20:47:16.68
\.


--
-- Data for Name: splitters; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.splitters (id, "projectId", "boxId", code, name, ratio, "splitterType", "inputCount", "outputCount", "insertionLossDb", status, "manufacturerId", model, version, "createdAt", "updatedAt", "deletedAt") FROM stdin;
efa41b29-486e-4e02-b79b-50f181b99aa8	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	b966e576-01c0-47c0-afd9-25920082fcc5	SPL-1789667218649	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 17:46:58.65	2026-09-17 17:46:58.65	\N
ef952c3d-c4d4-4b95-b180-708d541c0622	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	2860dcfb-62bc-469e-b704-f771f9091ba6	SPL-1789667463302	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 17:51:03.304	2026-09-17 17:51:03.304	\N
ffb82138-07a5-45ef-9ccf-1345c866d060	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	351256f1-86eb-4385-a25a-760afca079a3	SPL-1789667897226	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 17:58:17.229	2026-09-17 17:58:17.229	\N
a6d60471-1ca8-4bf4-a7f6-da4b1aefa279	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	e82e697a-3c81-45d7-ad64-7e65be0a7077	SPL-1789668215058	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 18:03:35.059	2026-09-17 18:03:35.059	\N
83b7f350-615b-4f56-8e85-421b75aa4766	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	4e18a2f2-6ebf-486c-8cd3-05bc1544f182	SPL-1789668576217	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 18:09:36.218	2026-09-17 18:09:36.218	\N
8cdee0ee-9401-44e9-b30d-9ac397a7a8d3	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	64d2a80c-aa59-4731-bea2-36ceff429fd4	SPL-1789675710836	Splitter Editado	1:16	BALANCED	1	8	\N	INACTIVE	\N	\N	1	2026-09-17 20:08:30.838	2026-09-17 20:09:34.339	\N
c1f75a55-ae0f-42bc-a38f-edfbbee577c1	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	a9001657-727c-4d0d-b9f4-ec8745831c71	MI-SPLITTER-01	\N	1:4	BALANCED	1	4	\N	ACTIVE	\N	\N	1	2026-09-17 20:18:06.431	2026-09-17 20:18:16.343	2026-09-17 20:18:16.342
cf531438-490d-4a8e-af0b-e0e87266dd4f	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	a9001657-727c-4d0d-b9f4-ec8745831c71	SPL-1	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 18:10:56.146	2026-09-17 20:22:04.749	\N
28a0694f-261f-4af7-bebf-9efd7fb4e619	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	d18a118b-c9d3-4c1b-830b-0f1b26240ca5	SPL-2	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 18:14:42.424	2026-09-17 20:22:13.81	\N
1bced315-ebef-4e6c-ad88-1f6ae7cea7d5	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	a9001657-727c-4d0d-b9f4-ec8745831c71	SPL-3	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 20:13:56.609	2026-09-17 20:22:25.053	\N
117ab5b4-abd6-4445-a916-d36670df4c26	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	a9001657-727c-4d0d-b9f4-ec8745831c71	SPL-4	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 20:01:02.297	2026-09-17 20:22:35.027	\N
cecd9c72-af8d-41a4-b9a4-af87b3760d00	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	a9001657-727c-4d0d-b9f4-ec8745831c71	SPL-5	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 20:24:20.435	2026-09-17 20:24:20.435	\N
45b5ec06-5fe0-4c7e-aede-aa71b86d36ea	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	b0066f77-9a4c-4df8-afcf-cd3e1aa579f8	SPL-1789677374161	\N	1:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 20:36:14.164	2026-09-17 20:36:14.164	\N
b6ef6790-2466-414f-a646-d4759b1936e2	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	6c9401cb-37ff-460c-bae2-dbed3e67c6d9	SPL-6	\N	4:8	BALANCED	1	8	\N	ACTIVE	\N	\N	1	2026-09-17 20:42:36.574	2026-09-17 20:42:36.574	\N
8067107b-01d7-4b1e-b1ef-0874c420d613	c4906e4b-6908-4dc6-b26d-f2f68576c3e2	6c9401cb-37ff-460c-bae2-dbed3e67c6d9	SPL-TEST-2	\N	1:4	BALANCED	1	4	\N	ACTIVE	\N	\N	1	2026-09-17 20:47:16.68	2026-09-17 20:48:40.034	2026-09-17 20:48:40.033
\.


--
-- Data for Name: switches; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.switches (id, code, name, "projectId", "popId", "rackId", "manufacturerId", "equipmentModelId", "managementIp", "portCount", status, description, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.users (id, name, email, "passwordHash", status, "lastLogin", "createdAt", "updatedAt", preferences) FROM stdin;
a8756567-55d2-4fe4-b1d6-89952a0b2232	Test Usuario	test.register@fibermap.local	$2b$10$DsHUWHV9g5gNZFMhD.kiBeOtX8unWWM9gnxdDfiLgnELiZQzqoi9K	INACTIVE	\N	2026-09-17 15:41:44.949	2026-09-17 15:41:52.111	\N
6524953d-40a2-46cb-84d7-a17d1efeab2f	Administrador	admin@fibermap.local	$2b$10$XJ7FYOrxVpAzdcWESX9zdeSaB21gJk9cQ1ucboE3J6KKW1WZlKNVy	ACTIVE	2026-09-21 14:34:06.162	2026-09-17 15:14:24.341	2026-09-21 14:34:06.163	\N
\.


--
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: fibermap
--

COPY public.zones (id, code, name, description, "regionId", "projectId", geometry, "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: fibermap
--

COPY tiger.geocode_settings (name, setting, unit, category, short_desc) FROM stdin;
\.


--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: fibermap
--

COPY tiger.pagc_gaz (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: fibermap
--

COPY tiger.pagc_lex (id, seq, word, stdword, token, is_custom) FROM stdin;
\.


--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: fibermap
--

COPY tiger.pagc_rules (id, rule, is_custom) FROM stdin;
\.


--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: fibermap
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: fibermap
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: fibermap
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- Name: _RolePermissions _RolePermissions_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public."_RolePermissions"
    ADD CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _UserRoles _UserRoles_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public."_UserRoles"
    ADD CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: box_ports box_ports_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.box_ports
    ADD CONSTRAINT box_ports_pkey PRIMARY KEY (id);


--
-- Name: box_templates box_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.box_templates
    ADD CONSTRAINT box_templates_pkey PRIMARY KEY (id);


--
-- Name: boxes boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.boxes
    ADD CONSTRAINT boxes_pkey PRIMARY KEY (id);


--
-- Name: cable_duct_assignments cable_duct_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_duct_assignments
    ADD CONSTRAINT cable_duct_assignments_pkey PRIMARY KEY (id);


--
-- Name: cable_route_nodes cable_route_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_route_nodes
    ADD CONSTRAINT cable_route_nodes_pkey PRIMARY KEY (id);


--
-- Name: cable_slacks cable_slacks_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_slacks
    ADD CONSTRAINT cable_slacks_pkey PRIMARY KEY (id);


--
-- Name: cables cables_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cables
    ADD CONSTRAINT cables_pkey PRIMARY KEY (id);


--
-- Name: chambers chambers_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.chambers
    ADD CONSTRAINT chambers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: dio_ports dio_ports_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.dio_ports
    ADD CONSTRAINT dio_ports_pkey PRIMARY KEY (id);


--
-- Name: dios dios_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.dios
    ADD CONSTRAINT dios_pkey PRIMARY KEY (id);


--
-- Name: ducts ducts_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.ducts
    ADD CONSTRAINT ducts_pkey PRIMARY KEY (id);


--
-- Name: equipment_manufacturers equipment_manufacturers_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.equipment_manufacturers
    ADD CONSTRAINT equipment_manufacturers_pkey PRIMARY KEY (id);


--
-- Name: equipment_models equipment_models_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.equipment_models
    ADD CONSTRAINT equipment_models_pkey PRIMARY KEY (id);


--
-- Name: fiber_reservations fiber_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fiber_reservations
    ADD CONSTRAINT fiber_reservations_pkey PRIMARY KEY (id);


--
-- Name: fiber_segments fiber_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fiber_segments
    ADD CONSTRAINT fiber_segments_pkey PRIMARY KEY (id);


--
-- Name: fiber_tubes fiber_tubes_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fiber_tubes
    ADD CONSTRAINT fiber_tubes_pkey PRIMARY KEY (id);


--
-- Name: fibers fibers_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fibers
    ADD CONSTRAINT fibers_pkey PRIMARY KEY (id);


--
-- Name: infrastructure_relations infrastructure_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.infrastructure_relations
    ADD CONSTRAINT infrastructure_relations_pkey PRIMARY KEY (id);


--
-- Name: network_nodes network_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.network_nodes
    ADD CONSTRAINT network_nodes_pkey PRIMARY KEY (id);


--
-- Name: odf_ports odf_ports_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.odf_ports
    ADD CONSTRAINT odf_ports_pkey PRIMARY KEY (id);


--
-- Name: odfs odfs_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.odfs
    ADD CONSTRAINT odfs_pkey PRIMARY KEY (id);


--
-- Name: olt_cards olt_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_cards
    ADD CONSTRAINT olt_cards_pkey PRIMARY KEY (id);


--
-- Name: olt_shelves olt_shelves_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_shelves
    ADD CONSTRAINT olt_shelves_pkey PRIMARY KEY (id);


--
-- Name: olt_slots olt_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_slots
    ADD CONSTRAINT olt_slots_pkey PRIMARY KEY (id);


--
-- Name: olt_templates olt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_templates
    ADD CONSTRAINT olt_templates_pkey PRIMARY KEY (id);


--
-- Name: olts olts_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olts
    ADD CONSTRAINT olts_pkey PRIMARY KEY (id);


--
-- Name: optical_connections optical_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_connections
    ADD CONSTRAINT optical_connections_pkey PRIMARY KEY (id);


--
-- Name: optical_connectors optical_connectors_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_connectors
    ADD CONSTRAINT optical_connectors_pkey PRIMARY KEY (id);


--
-- Name: optical_terminations optical_terminations_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_terminations
    ADD CONSTRAINT optical_terminations_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: poles poles_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT poles_pkey PRIMARY KEY (id);


--
-- Name: pon_ports pon_ports_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.pon_ports
    ADD CONSTRAINT pon_ports_pkey PRIMARY KEY (id);


--
-- Name: pops pops_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.pops
    ADD CONSTRAINT pops_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: racks racks_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT racks_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: splitter_ports splitter_ports_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.splitter_ports
    ADD CONSTRAINT splitter_ports_pkey PRIMARY KEY (id);


--
-- Name: splitters splitters_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.splitters
    ADD CONSTRAINT splitters_pkey PRIMARY KEY (id);


--
-- Name: switches switches_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: _RolePermissions_B_index; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "_RolePermissions_B_index" ON public."_RolePermissions" USING btree ("B");


--
-- Name: _UserRoles_B_index; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "_UserRoles_B_index" ON public."_UserRoles" USING btree ("B");


--
-- Name: box_ports_boxId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "box_ports_boxId_number_key" ON public.box_ports USING btree ("boxId", number);


--
-- Name: boxes_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "boxes_code_projectId_key" ON public.boxes USING btree (code, "projectId");


--
-- Name: cables_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "cables_code_projectId_key" ON public.cables USING btree (code, "projectId");


--
-- Name: chambers_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "chambers_code_projectId_key" ON public.chambers USING btree (code, "projectId");


--
-- Name: customers_geometry_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX customers_geometry_idx ON public.customers USING gist (geometry);


--
-- Name: customers_projectId_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "customers_projectId_idx" ON public.customers USING btree ("projectId");


--
-- Name: customers_status_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX customers_status_idx ON public.customers USING btree (status);


--
-- Name: dio_ports_dioId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "dio_ports_dioId_number_key" ON public.dio_ports USING btree ("dioId", number);


--
-- Name: dios_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "dios_code_projectId_key" ON public.dios USING btree (code, "projectId");


--
-- Name: ducts_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "ducts_code_projectId_key" ON public.ducts USING btree (code, "projectId");


--
-- Name: equipment_manufacturers_code_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX equipment_manufacturers_code_key ON public.equipment_manufacturers USING btree (code);


--
-- Name: fiber_tubes_cableId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "fiber_tubes_cableId_number_key" ON public.fiber_tubes USING btree ("cableId", number);


--
-- Name: fibers_cableId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "fibers_cableId_number_key" ON public.fibers USING btree ("cableId", number);


--
-- Name: fibers_tubeId_numberInTube_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "fibers_tubeId_numberInTube_key" ON public.fibers USING btree ("tubeId", "numberInTube");


--
-- Name: network_nodes_code_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX network_nodes_code_idx ON public.network_nodes USING btree (code);


--
-- Name: network_nodes_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "network_nodes_code_projectId_key" ON public.network_nodes USING btree (code, "projectId");


--
-- Name: network_nodes_geometry_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX network_nodes_geometry_idx ON public.network_nodes USING gist (geometry);


--
-- Name: network_nodes_nodeType_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "network_nodes_nodeType_idx" ON public.network_nodes USING btree ("nodeType");


--
-- Name: network_nodes_projectId_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "network_nodes_projectId_idx" ON public.network_nodes USING btree ("projectId");


--
-- Name: network_nodes_status_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX network_nodes_status_idx ON public.network_nodes USING btree (status);


--
-- Name: odf_ports_odfId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "odf_ports_odfId_number_key" ON public.odf_ports USING btree ("odfId", number);


--
-- Name: odfs_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "odfs_code_projectId_key" ON public.odfs USING btree (code, "projectId");


--
-- Name: olt_cards_slotId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "olt_cards_slotId_key" ON public.olt_cards USING btree ("slotId");


--
-- Name: olt_shelves_oltId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "olt_shelves_oltId_number_key" ON public.olt_shelves USING btree ("oltId", number);


--
-- Name: olt_slots_shelfId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "olt_slots_shelfId_number_key" ON public.olt_slots USING btree ("shelfId", number);


--
-- Name: olts_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "olts_code_projectId_key" ON public.olts USING btree (code, "projectId");


--
-- Name: olts_odfPortId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "olts_odfPortId_key" ON public.olts USING btree ("odfPortId");


--
-- Name: optical_connections_sourceFiberId_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "optical_connections_sourceFiberId_idx" ON public.optical_connections USING btree ("sourceFiberId");


--
-- Name: optical_connections_targetFiberId_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "optical_connections_targetFiberId_idx" ON public.optical_connections USING btree ("targetFiberId");


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: poles_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "poles_code_projectId_key" ON public.poles USING btree (code, "projectId");


--
-- Name: poles_projectId_idx; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE INDEX "poles_projectId_idx" ON public.poles USING btree ("projectId");


--
-- Name: pon_ports_cardId_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "pon_ports_cardId_number_key" ON public.pon_ports USING btree ("cardId", number);


--
-- Name: pops_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "pops_code_projectId_key" ON public.pops USING btree (code, "projectId");


--
-- Name: projects_code_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX projects_code_key ON public.projects USING btree (code);


--
-- Name: racks_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "racks_code_projectId_key" ON public.racks USING btree (code, "projectId");


--
-- Name: regions_code_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX regions_code_key ON public.regions USING btree (code);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: splitter_ports_splitterId_portType_number_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "splitter_ports_splitterId_portType_number_key" ON public.splitter_ports USING btree ("splitterId", "portType", number);


--
-- Name: splitters_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "splitters_code_projectId_key" ON public.splitters USING btree (code, "projectId");


--
-- Name: switches_code_projectId_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX "switches_code_projectId_key" ON public.switches USING btree (code, "projectId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: zones_code_key; Type: INDEX; Schema: public; Owner: fibermap
--

CREATE UNIQUE INDEX zones_code_key ON public.zones USING btree (code);


--
-- Name: _RolePermissions _RolePermissions_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public."_RolePermissions"
    ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _RolePermissions _RolePermissions_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public."_RolePermissions"
    ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserRoles _UserRoles_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public."_UserRoles"
    ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserRoles _UserRoles_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public."_UserRoles"
    ADD CONSTRAINT "_UserRoles_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: box_ports box_ports_boxId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.box_ports
    ADD CONSTRAINT "box_ports_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES public.boxes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: boxes boxes_chamberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.boxes
    ADD CONSTRAINT "boxes_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES public.chambers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: boxes boxes_poleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.boxes
    ADD CONSTRAINT "boxes_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES public.poles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: boxes boxes_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.boxes
    ADD CONSTRAINT "boxes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cable_duct_assignments cable_duct_assignments_cableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_duct_assignments
    ADD CONSTRAINT "cable_duct_assignments_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES public.cables(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cable_duct_assignments cable_duct_assignments_ductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_duct_assignments
    ADD CONSTRAINT "cable_duct_assignments_ductId_fkey" FOREIGN KEY ("ductId") REFERENCES public.ducts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cable_route_nodes cable_route_nodes_cableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_route_nodes
    ADD CONSTRAINT "cable_route_nodes_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES public.cables(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cable_slacks cable_slacks_cableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cable_slacks
    ADD CONSTRAINT "cable_slacks_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES public.cables(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cables cables_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.cables
    ADD CONSTRAINT "cables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chambers chambers_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.chambers
    ADD CONSTRAINT "chambers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: customers customers_nearestBoxId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_nearestBoxId_fkey" FOREIGN KEY ("nearestBoxId") REFERENCES public.boxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dio_ports dio_ports_dioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.dio_ports
    ADD CONSTRAINT "dio_ports_dioId_fkey" FOREIGN KEY ("dioId") REFERENCES public.dios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dios dios_popId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.dios
    ADD CONSTRAINT "dios_popId_fkey" FOREIGN KEY ("popId") REFERENCES public.pops(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dios dios_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.dios
    ADD CONSTRAINT "dios_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dios dios_rackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.dios
    ADD CONSTRAINT "dios_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES public.racks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ducts ducts_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.ducts
    ADD CONSTRAINT "ducts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: equipment_models equipment_models_manufacturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.equipment_models
    ADD CONSTRAINT "equipment_models_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES public.equipment_manufacturers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fiber_reservations fiber_reservations_fiberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fiber_reservations
    ADD CONSTRAINT "fiber_reservations_fiberId_fkey" FOREIGN KEY ("fiberId") REFERENCES public.fibers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fiber_segments fiber_segments_fiberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fiber_segments
    ADD CONSTRAINT "fiber_segments_fiberId_fkey" FOREIGN KEY ("fiberId") REFERENCES public.fibers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fiber_tubes fiber_tubes_cableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fiber_tubes
    ADD CONSTRAINT "fiber_tubes_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES public.cables(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fibers fibers_tubeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.fibers
    ADD CONSTRAINT "fibers_tubeId_fkey" FOREIGN KEY ("tubeId") REFERENCES public.fiber_tubes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: odf_ports odf_ports_odfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.odf_ports
    ADD CONSTRAINT "odf_ports_odfId_fkey" FOREIGN KEY ("odfId") REFERENCES public.odfs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: odfs odfs_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.odfs
    ADD CONSTRAINT "odfs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: olt_cards olt_cards_slotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_cards
    ADD CONSTRAINT "olt_cards_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES public.olt_slots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: olt_shelves olt_shelves_oltId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_shelves
    ADD CONSTRAINT "olt_shelves_oltId_fkey" FOREIGN KEY ("oltId") REFERENCES public.olts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: olt_slots olt_slots_shelfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olt_slots
    ADD CONSTRAINT "olt_slots_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES public.olt_shelves(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: olts olts_odfPortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olts
    ADD CONSTRAINT "olts_odfPortId_fkey" FOREIGN KEY ("odfPortId") REFERENCES public.odf_ports(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: olts olts_popId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olts
    ADD CONSTRAINT "olts_popId_fkey" FOREIGN KEY ("popId") REFERENCES public.pops(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: olts olts_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olts
    ADD CONSTRAINT "olts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: olts olts_rackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.olts
    ADD CONSTRAINT "olts_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES public.racks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: optical_connections optical_connections_sourceFiberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_connections
    ADD CONSTRAINT "optical_connections_sourceFiberId_fkey" FOREIGN KEY ("sourceFiberId") REFERENCES public.fibers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: optical_connections optical_connections_sourceTerminationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_connections
    ADD CONSTRAINT "optical_connections_sourceTerminationId_fkey" FOREIGN KEY ("sourceTerminationId") REFERENCES public.optical_terminations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: optical_connections optical_connections_targetFiberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_connections
    ADD CONSTRAINT "optical_connections_targetFiberId_fkey" FOREIGN KEY ("targetFiberId") REFERENCES public.fibers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: optical_connections optical_connections_targetTerminationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_connections
    ADD CONSTRAINT "optical_connections_targetTerminationId_fkey" FOREIGN KEY ("targetTerminationId") REFERENCES public.optical_terminations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: optical_terminations optical_terminations_boxId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_terminations
    ADD CONSTRAINT "optical_terminations_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES public.boxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: optical_terminations optical_terminations_dioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_terminations
    ADD CONSTRAINT "optical_terminations_dioId_fkey" FOREIGN KEY ("dioId") REFERENCES public.dios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: optical_terminations optical_terminations_odfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_terminations
    ADD CONSTRAINT "optical_terminations_odfId_fkey" FOREIGN KEY ("odfId") REFERENCES public.odfs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: optical_terminations optical_terminations_oltId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.optical_terminations
    ADD CONSTRAINT "optical_terminations_oltId_fkey" FOREIGN KEY ("oltId") REFERENCES public.olts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: poles poles_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT "poles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pon_ports pon_ports_cardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.pon_ports
    ADD CONSTRAINT "pon_ports_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES public.olt_cards(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pon_ports pon_ports_oltId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.pon_ports
    ADD CONSTRAINT "pon_ports_oltId_fkey" FOREIGN KEY ("oltId") REFERENCES public.olts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pops pops_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.pops
    ADD CONSTRAINT "pops_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: racks racks_popId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT "racks_popId_fkey" FOREIGN KEY ("popId") REFERENCES public.pops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: racks racks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT "racks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: regions regions_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT "regions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: splitter_ports splitter_ports_splitterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.splitter_ports
    ADD CONSTRAINT "splitter_ports_splitterId_fkey" FOREIGN KEY ("splitterId") REFERENCES public.splitters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: splitters splitters_boxId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.splitters
    ADD CONSTRAINT "splitters_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES public.boxes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: splitters splitters_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.splitters
    ADD CONSTRAINT "splitters_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: switches switches_popId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT "switches_popId_fkey" FOREIGN KEY ("popId") REFERENCES public.pops(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: switches switches_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT "switches_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: switches switches_rackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT "switches_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES public.racks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: zones zones_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT "zones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: zones zones_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: fibermap
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT "zones_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

