import React from 'react';
import styled from 'styled-components';
import Rivet from '../hoc/Rivet';
import {
  FlexAcross,
  FlexDown,
} from '../blocks/Flex';
import {
  selectUserExists,
  selectUserFullName,
  selectUserProfilePhoto,
} from '../selectors';
import { Detail } from '../blocks/Type';

const ProfilePhoto = styled.div`
  ${props => props.theme.reset}

  width: 48px;
  height: 48px;

  background-size: cover;
  background-image: url(${props => props.src});

  ${props => props.theme.smallMarginRight}

  border-radius: 50%;
  ${props => props.theme.defaultBorderStyle}
`;

const Tagline = styled(Detail)`
  ${props => props.theme.extraTinyMarginTop}
`;

const Byline = (props) => {
  const {
    exists,
    fullName,
    profilePhoto,
    tagline,
  } = props;

  if (! exists) {
    // TODO: Return blank shape
    return null;
  }

  return (
    <FlexAcross>
      <ProfilePhoto src={profilePhoto} />
      <FlexDown>
        <Detail enlarge boldend>{fullName}</Detail>
        {tagline ? <Tagline>{tagline}</Tagline> : null}
      </FlexDown>
    </FlexAcross>
  );
};

Byline.mapStateToProps = (state, ownProps) => ({
  exists: selectUserExists(ownProps.userId, state),
  fullName: selectUserExists(ownProps.userId, state) ?
    selectUserFullName(ownProps.userId, state) : null,
  profilePhoto: selectUserExists(ownProps.userId, state) ?
    selectUserProfilePhoto(ownProps.userId, state) : null,
});

export default Rivet(Byline);