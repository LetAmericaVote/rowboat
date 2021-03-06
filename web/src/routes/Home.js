import React from 'react';
import styled from 'styled-components';
import Rivet from '../hoc/Rivet';
import Section from '../blocks/Section';
import EventMap from '../components/EventMap';
import SearchBar from '../components/SearchBar';
import SearchResult from '../components/SearchResult';
import CommunitySignup from '../components/CommunitySignup';
import Focus from '../components/Focus';
import Spacer from '../blocks/Spacer';
import InternalLink from '../routing/InternalLink';
import communityBackground from '../assets/art/community.png';
import {
  selectEventsSortedByDistance,
  selectEventsSortedByDatetime,
} from '../selectors';
import {
  SEARCH_ROUTE,
} from '../routing/routes';
import {
  CallToActionButton,
} from '../blocks/Button';
import {
  Hero,
  HeroHighlight,
  HeroBold,
  HeroInverted,
  SectionHeader,
  Paragraph,
  InvertedSectionHeader,
  InvertedStyledAnchor,
  InvertedDetail,
} from '../blocks/Type';
import {
  FlexDown,
  FlexDownCenter,
  FlexAcrossJustifyCenter,
  FlexResponsiveRow,
  FlexResponsiveHalfColumn,
  FlexResponsiveThirdColumn,
} from '../blocks/Flex';
import {
  HOME_HERO,
  HOME_HERO_2,
  HOME_DESCRIPTION,
  HOME_CALL_TO_ACTION,
  HOME_SUB_HEADER,
  HOME_SUB_1,
  HOME_SUB_2,
  HOME_QUOTE,
  HOME_STRAT,
  HOME_EVENT_HEADER,
  QUOTE_SOURCE_AKA_PUTINS_ASSET,
  HOME_COMMUNITY_HERO,
} from '../copy';

const SearchBarContainer = styled.div`
  ${props => props.theme.reset}

  flex-grow: 1;

  ${props => props.theme.baseMarginBottom}

  ${props => props.theme.tablet`
    margin-bottom: 0;

    ${props => props.theme.baseMarginRight}
  `}
`;

const QuoteContainer = styled(FlexDownCenter)`
  width: 100%;
  min-height: 100vh;

  ${props => props.theme.bg.secondary}
`;

const Quote = styled(InvertedSectionHeader)`
  font-style: italic;
`;

const Connection = styled.div`
  ${props => props.theme.reset}

  width: 2px;
  height: 128px;

  ${props => props.theme.bg.paper}

  ${props => props.theme.baseMarginVertical}
`;

const HomeSearchResultsComponent = (props) => {
  const { events } = props;

  if (! events || ! events.length) {
    return null;
  }

  const record = {};

  return events.map((event) => {
    if (record[event.id]) {
      return null;
    }

    record[event.id] = true;

    return (
      <FlexResponsiveThirdColumn key={event.id}>
        <SearchResult reduced eventId={event.id} />
      </FlexResponsiveThirdColumn>
    );
  });
};

HomeSearchResultsComponent.mapStateToProps = (state) => {
  const records = {};
  const events = selectEventsSortedByDistance(state)
    .concat(selectEventsSortedByDatetime(state))
    .filter(event => new Date(event.dateTime).getTime() > Date.now());

  const uniqueEvents = events.filter(event => {
    if (records[event.id]) {
      return false;
    }

    records[event.id] = true;
    return true;
  }).splice(0, 12);

  return {
    events: uniqueEvents,
  };
};

const HomeSearchResults = Rivet(HomeSearchResultsComponent);

const Home = (props) => {
  return (
    <FlexDown>
      <Spacer medium />
      <Section>
        <FlexDown>
          <Hero centered reducedMargin>{HOME_HERO[0]}<HeroHighlight>{HOME_HERO[1]}</HeroHighlight></Hero>
          <Hero centered>{HOME_HERO[2]}<HeroHighlight>{HOME_HERO[3]}</HeroHighlight></Hero>
          <HeroBold centered>{HOME_HERO_2}</HeroBold>
          <Paragraph centered>{HOME_DESCRIPTION}</Paragraph>
          <FlexResponsiveRow>
            <SearchBarContainer>
              <SearchBar />
            </SearchBarContainer>
            <InternalLink to={SEARCH_ROUTE}>
              <CallToActionButton centered>{HOME_CALL_TO_ACTION}</CallToActionButton>
            </InternalLink>
          </FlexResponsiveRow>
          <Spacer extraLarge />
          <FlexResponsiveRow>
            <FlexResponsiveHalfColumn>
              <FlexDown>
                <SectionHeader>{HOME_SUB_HEADER}</SectionHeader>
                <Paragraph>{HOME_SUB_1}</Paragraph>
                <Paragraph>{HOME_SUB_2}</Paragraph>
              </FlexDown>
            </FlexResponsiveHalfColumn>
            <FlexResponsiveHalfColumn>
              <EventMap />
            </FlexResponsiveHalfColumn>
          </FlexResponsiveRow>
        </FlexDown>
      </Section>
      <QuoteContainer>
        <Section>
          <FlexDownCenter>
            <Spacer />
            <Quote centered>{HOME_QUOTE}</Quote>
            <InvertedDetail>{QUOTE_SOURCE_AKA_PUTINS_ASSET}</InvertedDetail>
            <Spacer />
            <HeroInverted centered reducedMargin>{HOME_STRAT[0]}</HeroInverted>
            <HeroInverted centered reducedMargin><HeroHighlight>{HOME_STRAT[1]}</HeroHighlight></HeroInverted>
            <HeroInverted centered>{HOME_STRAT[2]}</HeroInverted>
          </FlexDownCenter>
          <FlexAcrossJustifyCenter>
            <Connection />
          </FlexAcrossJustifyCenter>
          <FlexDown>
            <Spacer medium />
            <InvertedSectionHeader>{HOME_EVENT_HEADER}</InvertedSectionHeader>
            <FlexResponsiveRow wrap>
              <HomeSearchResults />
            </FlexResponsiveRow>
            <Spacer />
            <InternalLink to={SEARCH_ROUTE}>
              <InvertedStyledAnchor>Can't find what you're looking for? Search for more events.</InvertedStyledAnchor>
            </InternalLink>
          </FlexDown>
        </Section>
      </QuoteContainer>
      <Spacer />
      <Section>
        <FlexDown>
          <Focus
            src={communityBackground}
            headerCopy="This is about building a community"
            callToActionCopy="To protect voting rights"
          />
          <Spacer medium />
          <CommunitySignup />
        </FlexDown>
      </Section>
    </FlexDown>
  );
}

export default Rivet(Home);
