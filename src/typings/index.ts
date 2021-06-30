// Global types (types not confined to one component) go here

export type FiatOffItem = {
    thumbnail: string;
    title: string;
    url: string;
    traits: Array<FiatOffTraitItem>;
}

export type FiatOffTraitItem = {
    title: string;
    icon: string;
}

export type SnapshotSpaceProps = {
    name: string;
    symbol: string;
    network: string;
};
