import styled from 'styled-components';
import logo from '../assets/icons/logo.svg';
import logoLong from '../assets/icons/logo-long.png';
import googleLogo from '../assets/icons/g-logo.png';
import search from '../assets/icons/search.svg';
import gps from '../assets/icons/gps.svg';
import calendar from '../assets/icons/calendar.svg';
import house from '../assets/icons/house.svg';
import reply from '../assets/icons/reply.svg';
import share from '../assets/icons/share.svg';
import smile from '../assets/icons/smile.svg';
import dotMenu from '../assets/icons/dot-menu.svg';
import pencil from '../assets/icons/pencil.svg';
import facebookLogo from '../assets/icons/facebook-logo.png';
import twitterLogo from '../assets/icons/twitter-logo.png';
import youtubeLogo from '../assets/icons/youtube-logo.png';

export const Logo = styled.div`
  ${props => props.theme.reset}

  width: 60px;
  height: 37px;

  background-image: url(${logo});
  background-size: 100% 100%;
`;

export const LogoLong = styled.div`
  ${props => props.theme.reset}

  width: 143px;
  height: 14px;

  background-image: url(${logoLong});
  background-size: 100% 100%;
`;

const BaseIcon = styled.div`
  ${props => props.theme.reset}

  width: 32px;
  height: 32px;

  background-size: 100% 100%;
`;

export const SearchIcon = styled(BaseIcon)`
  background-image: url(${search});
`;

export const GpsIcon = styled(BaseIcon)`
  background-image: url(${gps});
`;

export const CalendarIcon = styled(BaseIcon)`
  background-image: url(${calendar});
`;

export const HouseIcon = styled(BaseIcon)`
  background-image: url(${house});
`;

export const SmileIcon = styled(BaseIcon)`
  background-image: url(${smile});
`;

export const DotMenuIcon = styled(BaseIcon)`
  background-image: url(${dotMenu});
`;

export const GoogleIcon = styled.div`
  ${props => props.theme.reset}

  width: 20px;
  height: 20px;

  ${props => props.theme.smallMarginRight}

  background-image: url(${googleLogo});
  background-size: 100% 100%;
`;

export const ReplyIcon = styled(BaseIcon)`
  background-image: url(${reply});
  width: 16px;
  height: 16px;
`;

export const ShareIcon = styled(BaseIcon)`
  background-image: url(${share});
  width: 16px;
  height: 16px;
`;

export const PencilIcon = styled(BaseIcon)`
  background-image: url(${pencil});
  width: 16px;
  height: 16px;
`;

export const SocialIcon = styled(BaseIcon)`
  width: 32px;
  height: 32px;
  ${props => props.theme.extraTinyMargin}
`;

export const FacebookIcon = styled(SocialIcon)`
  background-image: url(${facebookLogo});
`;

export const TwitterIcon = styled(SocialIcon)`
  background-image: url(${twitterLogo});
`;

export const YoutubeIcon = styled(SocialIcon)`
  background-image: url(${youtubeLogo});
`;
