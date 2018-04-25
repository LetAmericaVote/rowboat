import React from 'react';
import copy from 'clipboard-copy';
import Rivet from '../hoc/Rivet';
import Byline from './Byline';
import ThreadReply from './ThreadReply';
import WriteComment from './WriteComment';
import Spacer from '../blocks/Spacer';
import CommunityContainer from '../blocks/CommunityContainer';
import {
  makeCommentRoute,
  makeEventCommentRoute,
} from '../routing/routes';
import {
  ReplyIcon,
  ShareIcon,
  DotMenuIcon,
  PencilIcon,
} from '../blocks/Icons';
import {
  MenuButton,
} from '../blocks/Button';
import {
  Paragraph,
  Detail,
} from '../blocks/Type';
import {
  FlexDown,
  FlexAcross,
  FlexAcrossWrap,
  FlexAcrossJustifyCenter,
} from '../blocks/Flex';
import {
  selectCommentUserId,
  selectCommentCreatedAt,
  selectCommentMessage,
  selectEventTitle,
  selectRepliesForCommentSortedByRecent,
  selectIsCommentFlagged,
  selectFormValue,
  selectEventSlug,
  selectAuthUserId,
  selectAuthenticatedUserRole,
} from '../selectors';
import {
  fetchPaginatedComments,
  setFormValue,
  openCommentModal,
} from '../actions';

const Thread = (props) => {
  const {
    userId,
    createdAt,
    message,
    eventTitle,
    replies,
    fetchPaginatedComments,
    eventId,
    commentId,
    isFlagged,
    showReplyBox,
    setFormValue,
    eventSlug,
    showShareConfirmation,
    openCommentModal,
    modalView,
    authUserId,
    authUserRole,
  } = props;

  // TODO: Display dropdown menu --> open same thread modal?
  //   - edit
  //   - edit history
  //   - delete (user only)
  //   - flag (admin // host only)

  const minutesSince = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
  const hoursSince = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  const formattedTime = createdAt ? (
    new Date(createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  ) : '';

  const timeframe = minutesSince < 60 ? `${minutesSince} minutes ago` : (
    hoursSince <= 12 ? `${hoursSince} hours ago` : `at ${formattedTime}`
  );
  const tagline = `Posted in ${eventTitle ? `"${eventTitle}"` : 'the community'} ${timeframe}.`;

  const path = eventId ? makeEventCommentRoute(eventSlug, commentId) : makeCommentRoute(commentId);
  const link = `${window.location.origin}${path}`;

  const showReply = () => setFormValue('reply', commentId, true);
  const copyLink = () => {
    setFormValue('share', commentId, true);
    copy(link);
  };
  const openModal = () => openCommentModal(commentId, eventSlug);

  const buttons = [
    <MenuButton rightIndent key="reply" onClick={showReply}>
      <FlexAcross>
        <ReplyIcon />
        <Detail indent>Reply</Detail>
      </FlexAcross>
    </MenuButton>,
    <MenuButton rightIndent key="share" onClick={copyLink}>
      <FlexAcross>
        <ShareIcon />
        <Detail indent>Share</Detail>
      </FlexAcross>
    </MenuButton>,
  ];

  if (modalView) {
    if (authUserId === userId) {
      buttons.push(
        <MenuButton rightIndent key="edit">
          <FlexAcross>
            <PencilIcon />
            <Detail indent>Edit</Detail>
          </FlexAcross>
        </MenuButton>
      );
    }

    if (authUserRole === 'ADMIN') {
      buttons.push(
        <MenuButton rightIndent key="edit">
          <FlexAcross>
            <Detail>Flag</Detail>
          </FlexAcross>
        </MenuButton>
      );
    }
  } else {
    buttons.push(
      <MenuButton key="dot-menu" onClick={openModal}>
        <DotMenuIcon />
      </MenuButton>
    );
  }

  const onViewMoreReplies = () =>
    fetchPaginatedComments(-1, eventId, null, commentId, 10);

  return (
    <CommunityContainer isFlagged={isFlagged} noBottomMargin={modalView}>
      <Byline userId={userId} tagline={tagline} eventId={eventId} />
      <Spacer />
      <Paragraph>{message}</Paragraph>
      <FlexAcrossWrap>
        {buttons}
      </FlexAcrossWrap>
      {showShareConfirmation ? (
        <FlexDown>
          <Detail boldend>Copied to clipboard.</Detail>
          <Detail>{link}</Detail>
        </FlexDown>
      ) : null}
      {showReplyBox ? [
        <Spacer key="spacer" />,
        <WriteComment
          key="reply"
          inReplyToId={commentId}
          eventId={eventId}
        />
      ] : null}
      <Spacer />
      <FlexAcrossWrap>
        {replies.map(reply =>
          <ThreadReply key={reply.id} commentId={reply.id} />
        )}
      </FlexAcrossWrap>
      <MenuButton fill onClick={onViewMoreReplies}>
        <FlexAcrossJustifyCenter>
          <Detail>View More Replies</Detail>
        </FlexAcrossJustifyCenter>
      </MenuButton>
    </CommunityContainer>
  );
};

Thread.mapStateToProps = (state, ownProps) => ({
  userId: selectCommentUserId(ownProps.commentId, state),
  authUserId: selectAuthUserId(state),
  authUserRole: selectAuthenticatedUserRole(state),
  createdAt: selectCommentCreatedAt(ownProps.commentId, state),
  message: selectCommentMessage(ownProps.commentId, state),
  eventTitle: selectEventTitle(ownProps.eventId, state),
  eventSlug: selectEventSlug(ownProps.eventId, state),
  replies: selectRepliesForCommentSortedByRecent(ownProps.commentId, state),
  isFlagged: selectIsCommentFlagged(ownProps.commentId, state),
  showReplyBox: selectFormValue('reply', ownProps.commentId, state),
  showShareConfirmation: selectFormValue('share', ownProps.commentId, state),
});

Thread.actionCreators = {
  fetchPaginatedComments,
  setFormValue,
  openCommentModal,
};

export default Rivet(Thread);
