
export enum Network {
  SUI = 'SUI',
  EVM = 'EVM',
  IOTA = 'IOTA',
}

export enum Feature {
    MINT = 'Mint',
    LIQUIDITY = 'Liquidity',
    SWAP = 'Swap',
    LAUNCHPAD = 'Launchpad',
}

export interface Token {
    symbol: string;
    name: string;
    logo: string;
}

export interface LaunchpadProject {
    id: string;
    name: string;
    description: string;
    logo: string;
    raised: number;
    goal: number;
    tokenSymbol: string;
    status: 'Upcoming' | 'Live' | 'Ended';
}