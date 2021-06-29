// Global types (types not confined to one component) go here

export type FiatOffItem = {
    thumbnail: string;
    title: string;
    url: string;
    traits: Array<TraitItem>;
}

export type TraitItem = {
    title: string;
    icon: string;
}
