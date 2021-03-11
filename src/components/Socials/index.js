import Github from '../../assets/images/socials/github.svg';
import Youtube from '../../assets/images/socials/youtube.svg';
import Telegram from '../../assets/images/socials/telegram.svg';
import Twitter from '../../assets/images/socials/twitter.svg';
import './styles.scss';

const socials = [
    {
        name: 'Twitter',
        image: Twitter,
        url: "https://twitter.com/octofinance",
    },
    {
        name: 'Telegram',
        image: Telegram,
        url: "https://t.me/OctoFi",
    },
    {
        name: 'Youtube',
        image: Youtube,
        url: "https://www.youtube.com/channel/UCQ8TelmjLpFKQAsZCXIs5Tw",
    },
    {
        name: 'Github',
        image: Github,
        url: "https://github.com/octofi",
    },
]
const Socials = props => {
    return (
        <div className="d-flex align-items-center justify-content-between">
            <ul className={'socials'}>
            {socials.map((social, i) => {
                return (
                    <li className={'socials__item'} key={social.name + i}>
                        <a href={social.url} target={"_blank"} rel={'noopener noreferrer'} className={'socials__link'}>
                            <img src={social.image} alt={social.name} className={'socials__image'}/>
                        </a>
                    </li>
                )
            })}
            </ul>
        </div>
    )
}

export default Socials;