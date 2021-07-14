import { SocialLink } from '../typings';
import Github from "../assets/images/socials/github.svg";
import Youtube from "../assets/images/socials/youtube.svg";
import Telegram from "../assets/images/socials/telegram.svg";
import Twitter from "../assets/images/socials/twitter.svg";

export const socials: Array<SocialLink> = [
    {
        name: "Twitter",
        image: Twitter,
        url: "https://twitter.com/octofinance",
    },
    {
        name: "Telegram",
        image: Telegram,
        url: "https://t.me/OctoFi",
    },
    {
        name: "Youtube",
        image: Youtube,
        url: "https://www.youtube.com/channel/UCQ8TelmjLpFKQAsZCXIs5Tw",
    },
    {
        name: "Github",
        image: Github,
        url: "https://github.com/octofi",
    },
];