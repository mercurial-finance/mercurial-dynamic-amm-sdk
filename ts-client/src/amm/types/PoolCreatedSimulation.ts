import { Amm } from '../idl';
import { SimulateResponse } from '@coral-xyz/anchor/dist/cjs/program/namespace/simulate';

export type PoolCreatedSimulation = Omit<SimulateResponse<Amm['events']['8'], ''>, ''>;
