// Global types (types not confined to one component) go here

export type Banner = {
    image: string;
    url: string;
}

export type Feature = {
    href: string;
    iconName: string;
    title: string;
    desc: string;
}

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

export type SocialLink = {
    name: string;
    image: string;
    url: string;
};
