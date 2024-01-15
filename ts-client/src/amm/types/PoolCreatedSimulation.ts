import { Amm } from '../idl';
import { SimulateResponse } from '@project-serum/anchor/dist/cjs/program/namespace/simulate';

export type PoolCreatedSimulation = Omit<SimulateResponse<Amm['events']['9'], ''>, ''>;
