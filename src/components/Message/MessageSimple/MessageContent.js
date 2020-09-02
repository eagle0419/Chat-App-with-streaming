import React, { useContext, useRef } from 'react';
import styled from '@stream-io/styled-components';
import PropTypes from 'prop-types';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet';
import Immutable from 'seamless-immutable';

import DefaultMessageReplies from './MessageReplies';
import MessageTextContainer from './MessageTextContainer';

import DefaultAttachment from '../../Attachment/Attachment';
import DefaultFileAttachment from '../../Attachment/FileAttachment';
import DefaultFileAttachmentGroup from '../../Attachment/FileAttachmentGroup';
import DefaultGallery from '../../Attachment/Gallery';
import DefaultReactionList from '../../Reaction/ReactionList';
import ReactionPickerWrapper from '../../Reaction/ReactionPickerWrapper';

import {
  ChannelContext,
  KeyboardContext,
  MessageContentContext,
  MessagesContext,
  TranslationContext,
} from '../../../context';
import { themed } from '../../../styles/theme';
import { emojiData, MESSAGE_ACTIONS } from '../../../utils/utils';

const ActionSheetButtonContainer = styled.View`
  align-items: center;
  background-color: #fff;
  height: 50px;
  justify-content: center;
  width: 100%;
  ${({ theme }) => theme.message.actionSheet.buttonContainer.css};
`;

const ActionSheetButtonText = styled.Text`
  color: #388cea;
  font-size: 18px;
  ${({ theme }) => theme.message.actionSheet.buttonText.css};
`;

const ActionSheetCancelButtonContainer = styled.View`
  align-items: center;
  height: 50px;
  justify-content: center;
  width: 100%;
  ${({ theme }) => theme.message.actionSheet.cancelButtonContainer.css};
`;
const ActionSheetCancelButtonText = styled.Text`
  color: red;
  font-size: 18px;
  ${({ theme }) => theme.message.actionSheet.cancelButtonText.css};
`;

const ActionSheetTitleContainer = styled.View`
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  ${({ theme }) => theme.message.actionSheet.titleContainer.css};
`;

const ActionSheetTitleText = styled.Text`
  font-size: 14px;
  color: #757575;
  ${({ theme }) => theme.message.actionSheet.titleText.css};
`;

// Border radii are useful for the case of error message types only.
// Otherwise background is transparent, so border radius is not really visible.
const Container = styled.TouchableOpacity`
  align-items: ${({ alignment }) =>
    alignment === 'left' ? 'flex-start' : 'flex-end'};
  background-color: ${({ error, theme }) =>
    error
      ? theme.message.content.errorContainer.backgroundColor
      : theme.colors.transparent};
  border-bottom-left-radius: ${({ alignment, theme }) =>
    alignment === 'left'
      ? theme.message.content.container.borderRadiusS
      : theme.message.content.container.borderRadiusL}px;
  border-bottom-right-radius: ${({ alignment, theme }) =>
    alignment === 'left'
      ? theme.message.content.container.borderRadiusL
      : theme.message.content.container.borderRadiusS}px;
  border-top-left-radius: ${({ theme }) =>
    theme.message.content.container.borderRadiusL}px;
  border-top-right-radius: ${({ theme }) =>
    theme.message.content.container.borderRadiusL}px;
  justify-content: ${({ alignment }) =>
    alignment === 'left' ? 'flex-start' : 'flex-end'};
  max-width: 250px;
  padding: ${({ error }) => (error ? 5 : 0)}px;
  ${({ theme }) => theme.message.content.container.css};
`;

const ContainerInner = styled.View`
  align-items: ${({ alignment }) =>
    alignment === 'left' ? 'flex-start' : 'flex-end'};
  ${({ theme }) => theme.message.content.containerInner.css}
`;

const DeletedContainer = styled.View`
  align-items: ${({ alignment }) =>
    alignment === 'left' ? 'flex-start' : 'flex-end'};
  justify-content: ${({ alignment }) =>
    alignment === 'left' ? 'flex-start' : 'flex-end'};
  max-width: 250px;
  padding: 5px;
  ${({ theme }) => theme.message.content.deletedContainer.css};
`;

const DeletedText = styled.Text`
  color: #a4a4a4;
  font-size: 15px;
  line-height: 20px;
  ${({ theme }) => theme.message.content.deletedText.css};
`;

const FailedText = styled.Text`
  color: #a4a4a4;
  margin-right: 5px;
`;

const MetaContainer = styled.View`
  margin-top: 2px;
  ${({ theme }) => theme.message.content.metaContainer.css};
`;

const MetaText = styled.Text`
  color: ${({ theme }) => theme.colors.textGrey};
  font-size: 11px;
  text-align: ${({ alignment }) => (alignment === 'left' ? 'left' : 'right')};
  ${({ theme }) => theme.message.content.metaText.css};
`;

/**
 * Since this component doesn't consume `messages` from `MessagesContext`,
 * we memoized and broke it up to prevent new messages from re-rendering
 * each individual MessageContent component.
 */
const MessageContentWithContext = React.memo((props) => {
  const {
    AttachmentActions,
    AttachmentFileIcon,
    Card,
    CardCover,
    CardFooter,
    CardHeader,
    FileAttachment = DefaultFileAttachment,
    FileAttachmentGroup = DefaultFileAttachmentGroup,
    Gallery = DefaultGallery,
    Giphy,
    MessageFooter,
    MessageHeader,
    MessageText,
    UrlPreview,
    actionSheetStyles,
    additionalTouchableProps,
    alignment,
    canDeleteMessage,
    canEditMessage,
    dismissReactionPicker,
    formatDate,
    getTotalReactionCount,
    groupStyles,
    handleAction,
    handleDelete,
    handleEdit,
    handleReaction,
    hideReactionCount = false,
    hideReactionOwners = false,
    isMyMessage,
    markdownRules,
    message,
    messageActions = Object.keys(MESSAGE_ACTIONS),
    MessageReplies = DefaultMessageReplies,
    onLongPress,
    onMessageTouch,
    onPress,
    onThreadSelect,
    openReactionPicker,
    ReactionList = DefaultReactionList,
    reactionPickerVisible,
    reactionsEnabled = true,
    readOnly,
    repliesEnabled = true,
    retrySendMessage,
    supportedReactions = emojiData,
    threadList,
  } = props;

  const {
    Attachment = DefaultAttachment,
    disabled,
    Message,
    channel,
  } = useContext(ChannelContext);
  const { dismissKeyboard } = useContext(KeyboardContext);
  const { t, tDateTimeParser } = useContext(TranslationContext);

  const actionSheetRef = useRef(null);

  const onOpenThread = () => {
    if (onThreadSelect) {
      onThreadSelect(message);
    }
  };

  const onShowActionSheet = async () => {
    await dismissKeyboard();
    if (actionSheetRef.current) {
      actionSheetRef.current.show();
    }
  };

  const onActionPress = async (action) => {
    switch (action) {
      case MESSAGE_ACTIONS.edit:
        handleEdit();
        break;
      case MESSAGE_ACTIONS.delete:
        await handleDelete();
        break;
      case MESSAGE_ACTIONS.reply:
        onOpenThread();
        break;
      case MESSAGE_ACTIONS.reactions:
        openReactionPicker();
        break;
      default:
        break;
    }
  };

  const hasAttachment = Boolean(
    message && message.attachments && message.attachments.length,
  );
  const showTime = groupStyles[0] === 'single' || groupStyles[0] === 'bottom';
  const hasReactions =
    reactionsEnabled &&
    message.latest_reactions &&
    message.latest_reactions.length > 0;
  const options = [{ id: 'cancel', title: 'Cancel' }];
  const images =
    hasAttachment &&
    message.attachments.filter(
      (item) =>
        item.type === 'image' && !item.title_link && !item.og_scrape_url,
    );
  const files =
    hasAttachment && message.attachments.filter((item) => item.type === 'file');

  if (
    messageActions &&
    reactionsEnabled &&
    messageActions.indexOf(MESSAGE_ACTIONS.reactions) > -1
  ) {
    options.splice(1, 0, {
      id: MESSAGE_ACTIONS.reactions,
      title: t('Add Reaction'),
    });
  }

  if (
    messageActions &&
    repliesEnabled &&
    messageActions.indexOf(MESSAGE_ACTIONS.reply) > -1 &&
    !threadList
  ) {
    options.splice(1, 0, { id: MESSAGE_ACTIONS.reply, title: t('Reply') });
  }

  if (
    messageActions &&
    messageActions.indexOf(MESSAGE_ACTIONS.edit) > -1 &&
    canEditMessage()
  ) {
    options.splice(1, 0, {
      id: MESSAGE_ACTIONS.edit,
      title: t('Edit Message'),
    });
  }

  if (
    messageActions &&
    messageActions.indexOf(MESSAGE_ACTIONS.delete) > -1 &&
    canDeleteMessage()
  ) {
    options.splice(1, 0, {
      id: MESSAGE_ACTIONS.delete,
      title: t('Delete Message'),
    });
  }

  if (message.deleted_at) {
    return (
      <DeletedContainer alignment={alignment}>
        <DeletedText testID='message-deleted'>
          {t('This message was deleted ...')}
        </DeletedText>
      </DeletedContainer>
    );
  }

  const contentProps = {
    activeOpacity: 0.7,
    alignment,
    disabled: disabled || readOnly,
    hasReactions,
    onLongPress:
      onLongPress && !(disabled || readOnly)
        ? (e) => onLongPress(message, e)
        : options.length > 1 && !(disabled || readOnly)
        ? onShowActionSheet
        : () => null,
    onPress: onPress ? (e) => onPress(message, e) : onMessageTouch,
    status: message.status,
    ...additionalTouchableProps,
  };

  if (message.status === 'failed') {
    contentProps.onPress = () => retrySendMessage(Immutable(message));
  }

  const context = {
    additionalTouchableProps,
    disabled: disabled || readOnly,
    onLongPress: contentProps.onLongPress,
  };

  return (
    <MessageContentContext.Provider value={context}>
      <Container
        {...contentProps}
        error={message.type === 'error' || message.status === 'failed'}
        testID='message-content-wrapper'
      >
        {message.type === 'error' ? (
          <FailedText testID='message-error'>{t('ERROR · UNSENT')}</FailedText>
        ) : null}
        {message.status === 'failed' ? (
          <FailedText testID='message-failed'>
            {t('Message failed - try again')}
          </FailedText>
        ) : null}
        {reactionsEnabled && ReactionList && (
          <ReactionPickerWrapper
            alignment={alignment}
            dismissReactionPicker={dismissReactionPicker}
            handleReaction={handleReaction}
            hideReactionCount={hideReactionCount}
            hideReactionOwners={hideReactionOwners}
            message={message}
            offset={{
              left: 10,
              right: 10,
              top: 25,
            }}
            openReactionPicker={openReactionPicker}
            reactionPickerVisible={reactionPickerVisible}
            supportedReactions={supportedReactions}
          >
            {message.latest_reactions &&
              message.latest_reactions.length > 0 && (
                <ReactionList
                  alignment={alignment}
                  getTotalReactionCount={getTotalReactionCount}
                  latestReactions={message.latest_reactions}
                  reactionCounts={message.reaction_counts}
                  supportedReactions={supportedReactions}
                  visible={!reactionPickerVisible}
                />
              )}
          </ReactionPickerWrapper>
        )}
        {MessageHeader && <MessageHeader testID='message-header' {...props} />}
        {/* Reason for collapsible: https://github.com/facebook/react-native/issues/12966 */}
        <ContainerInner alignment={alignment} collapsable={false}>
          {hasAttachment &&
            message.attachments.map((attachment, index) => {
              // We handle files separately
              if (attachment.type === 'file') return null;
              if (
                attachment.type === 'image' &&
                !attachment.title_link &&
                !attachment.og_scrape_url
              )
                return null;
              return (
                <Attachment
                  actionHandler={handleAction}
                  alignment={alignment}
                  attachment={attachment}
                  AttachmentActions={AttachmentActions}
                  Card={Card}
                  CardCover={CardCover}
                  CardFooter={CardFooter}
                  CardHeader={CardHeader}
                  FileAttachment={FileAttachment}
                  Giphy={Giphy}
                  key={`${message.id}-${index}`}
                  UrlPreview={UrlPreview}
                />
              );
            })}
          {files && files.length > 0 && (
            <FileAttachmentGroup
              alignment={alignment}
              AttachmentActions={AttachmentActions}
              AttachmentFileIcon={AttachmentFileIcon}
              FileAttachment={FileAttachment}
              files={files}
              handleAction={handleAction}
              messageId={message.id}
            />
          )}
          {images && images.length > 0 && (
            <Gallery alignment={alignment} images={images} />
          )}
          <MessageTextContainer
            alignment={alignment}
            disabled={message.status === 'failed' || message.type === 'error'}
            groupStyles={groupStyles}
            handleReaction={handleReaction}
            isMyMessage={isMyMessage}
            markdownRules={markdownRules}
            message={message}
            Message={Message}
            MessageText={MessageText}
            openThread={onOpenThread}
          />
        </ContainerInner>
        {repliesEnabled ? (
          <MessageReplies
            alignment={alignment}
            channel={channel}
            isThreadList={!!threadList}
            message={message}
            openThread={onOpenThread}
          />
        ) : null}
        {MessageFooter && <MessageFooter testID='message-footer' {...props} />}
        {!MessageFooter && showTime ? (
          <MetaContainer testID='show-time'>
            <MetaText alignment={alignment}>
              {formatDate
                ? formatDate(message.created_at)
                : tDateTimeParser(message.created_at).format('LT')}
            </MetaText>
          </MetaContainer>
        ) : null}
        <ActionSheet
          cancelButtonIndex={0}
          destructiveButtonIndex={0}
          onPress={(index) => onActionPress(options[index].id)}
          options={options.map((o, i) => {
            if (i === 0) {
              return (
                <ActionSheetCancelButtonContainer>
                  <ActionSheetCancelButtonText>
                    {t('Cancel')}
                  </ActionSheetCancelButtonText>
                </ActionSheetCancelButtonContainer>
              );
            }
            return (
              <ActionSheetButtonContainer key={o.title}>
                <ActionSheetButtonText>{o.title}</ActionSheetButtonText>
              </ActionSheetButtonContainer>
            );
          })}
          ref={actionSheetRef}
          styles={actionSheetStyles}
          title={
            <ActionSheetTitleContainer>
              <ActionSheetTitleText>
                {t('Choose an action')}
              </ActionSheetTitleText>
            </ActionSheetTitleContainer>
          }
        />
      </Container>
    </MessageContentContext.Provider>
  );
});

const MessageContent = (props) => {
  const { retrySendMessage } = useContext(MessagesContext);

  return <MessageContentWithContext {...props} {...{ retrySendMessage }} />;
};

MessageContent.themePath = 'message.content';

MessageContent.propTypes = {
  /**
   * Style object for action sheet (used to message actions).
   * Supported styles: https://github.com/beefe/react-native-actionsheet/blob/master/lib/styles.js
   */
  actionSheetStyles: PropTypes.object,
  /**
   * Provide any additional props for `TouchableOpacity` which wraps `MessageContent` component here.
   * Please check docs for TouchableOpacity for supported props - https://reactnative.dev/docs/touchableopacity#props
   */
  additionalTouchableProps: PropTypes.object,
  /** Position of message. 'right' | 'left' */
  alignment: PropTypes.oneOf(['right', 'left']),
  /**
   * Custom UI component to display attachment actions. e.g., send, shuffle, cancel in case of giphy
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/AttachmentActions.js
   */
  AttachmentActions: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.elementType,
  ]),
  /**
   * Custom UI component for attachment icon for type 'file' attachment.
   * Defaults to: https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/FileIcon.js
   */
  AttachmentFileIcon: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.elementType,
  ]),
  /**
   * Custom UI component to display generic media type e.g. giphy, url preview etc
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/Card.js
   */
  Card: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Custom UI component to override default cover (between Header and Footer) of Card component.
   * Accepts the same props as Card component.
   */
  CardCover: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Custom UI component to override default Footer of Card component.
   * Accepts the same props as Card component.
   */
  CardFooter: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Custom UI component to override default header of Card component.
   * Accepts the same props as Card component.
   */
  CardHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /** Dismiss the reaction picker */
  dismissReactionPicker: PropTypes.func,
  /**
   * Custom UI component to display File type attachment.
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/FileAttachment.js
   */
  FileAttachment: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Custom UI component to display group of File type attachments or multiple file attachments (in single message).
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/FileAttachmentGroup.js
   */
  FileAttachmentGroup: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.elementType,
  ]),
  formatDate: PropTypes.func,
  /**
   * Custom UI component to display image attachments.
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/Gallery.js
   */
  Gallery: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Custom UI component to display Giphy image.
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/Card.js
   */
  Giphy: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Position of message in group - top, bottom, middle, single.
   *
   * Message group is a group of consecutive messages from same user. groupStyles can be used to style message as per their position in message group
   * e.g., user avatar (to which message belongs to) is only showed for last (bottom) message in group.
   */
  groupStyles: PropTypes.array,
  /** Handler for actions. Actions in combination with attachments can be used to build [commands](https://getstream.io/chat/docs/#channel_commands). */
  handleAction: PropTypes.func,
  /**
   * Handler to delete a current message.
   */
  handleDelete: PropTypes.func,
  /**
   * Handler to edit a current message. This message simply sets current message as value of `editing` property of channel context.
   * `editing` prop is then used by MessageInput component to switch to edit mode.
   */
  handleEdit: PropTypes.func,
  // enable hiding reaction count from reaction picker
  hideReactionCount: PropTypes.bool,
  // enable hiding reaction owners from reaction picker
  hideReactionOwners: PropTypes.bool,
  /** Object specifying rules defined within simple-markdown https://github.com/Khan/simple-markdown#adding-a-simple-extension */
  markdownRules: PropTypes.object,
  MessageFooter: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  MessageHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  MessageReplies: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /** Custom UI component for message text */
  MessageText: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /**
   * Function that overrides default behaviour when message is long pressed
   * e.g.
   *
   * if you would like to open reaction picker on message long press:
   *
   * ```
   * import { MessageSimple } from 'stream-chat-react-native' // or 'stream-chat-expo'
   * ...
   * const MessageUIComponent = (props) => {
   *  return (
   *    <MessageSimple
   *      {...props}
   *      onLongPress={(thisArg, message, e) => {
   *        props.openReactionPicker();
   *        // Or if you want to open action sheet
   *        // thisArg.showActionSheet();
   *      }}
   *  )
   * }
   *
   * Similarly, you can also call other methods available on MessageContent
   * component such as handleEdit, handleDelete, showActionSheet etc.
   *
   * Source - [MessageContent](https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/MessageSimple/MessageContent.js)
   *
   * By default we show action sheet with all the message actions on long press.
   * ```
   *
   * @param {Component} thisArg Reference to MessageContent component
   * @param message Message object which was long pressed
   * @param e       Event object for onLongPress event
   * */
  onLongPress: PropTypes.func,
  /**
   * Callback for onPress event on Message component
   *
   * @param e       Event object for onPress event
   * @param message Message object which was pressed
   *
   * @deprecated Use onPress instead
   * */
  onMessageTouch: PropTypes.func,
  /**
   * Function that overrides default behaviour when message is pressed/touched
   * e.g. if you would like to open reaction picker on message press:
   *
   * ```
   * import { MessageSimple } from 'stream-chat-react-native' // or 'stream-chat-expo'
   * ...
   * const MessageUIComponent = (props) => {
   *  return (
   *    <MessageSimple
   *      {...props}
   *      onPress={(thisArg, message, e) => {
   *        props.openReactionPicker();
   *        // Or if you want to open action sheet
   *        // thisArg.showActionSheet();
   *      }}
   *  )
   * }
   * ```
   *
   * Similarly, you can also call other methods available on MessageContent
   * component such as handleEdit, handleDelete, showActionSheet etc.
   *
   * Source - [MessageContent](https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/MessageSimple/MessageContent.js)
   *
   * @param {Component} thisArg Reference to MessageContent component
   * @param message Message object which was pressed
   * @param e       Event object for onPress event
   * */
  onPress: PropTypes.func,
  /**
   * Handler to open the thread on message. This is callback for touch event for replies button.
   *
   * @param message A message object to open the thread upon.
   * */
  onThreadSelect: PropTypes.func,
  /** Open the reaction picker */
  openReactionPicker: PropTypes.func,
  /**
   * Custom UI component to display reaction list.
   * Defaults to: https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/ReactionList.js
   */
  ReactionList: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  /** Boolean - if reaction picker is visible. Hides the reaction list in that case */
  reactionPickerVisible: PropTypes.bool,
  /** enabled reactions, this is usually set by the parent component based on channel configs */
  reactionsEnabled: PropTypes.bool.isRequired,
  /**
   * @deprecated Please use `disabled` instead.
   *
   * Disables the message UI. Which means, message actions, reactions won't work.
   */
  readOnly: PropTypes.bool,
  /** enabled replies, this is usually set by the parent component based on channel configs */
  repliesEnabled: PropTypes.bool.isRequired,
  /**
   * e.g.,
   * [
   *  {
   *    id: 'like',
   *    icon: '👍',
   *  },
   *  {
   *    id: 'love',
   *    icon: '❤️️',
   *  },
   *  {
   *    id: 'haha',
   *    icon: '😂',
   *  },
   *  {
   *    id: 'wow',
   *    icon: '😮',
   *  },
   * ]
   */
  supportedReactions: PropTypes.array,
  /** Whether or not the MessageList is part of a Thread */
  threadList: PropTypes.bool,
  /**
   * Custom UI component to display enriched url preview.
   * Defaults to https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/Card.js
   */
  UrlPreview: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
};

export default themed(MessageContent);
