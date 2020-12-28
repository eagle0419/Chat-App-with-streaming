import type { Channel, UserResponse } from 'stream-chat';
import type { ThreadContextValue } from 'stream-chat-react-native/v2';
import type { Theme } from '@react-navigation/native';

export type LocalAttachmentType = Record<string, unknown>;
export type LocalChannelType = Record<string, unknown>;
export type LocalCommandType = string;
export type LocalEventType = Record<string, unknown>;
export type LocalMessageType = Record<string, unknown>;
export type LocalReactionType = Record<string, unknown>;
export type LocalResponseType = Record<string, unknown>;
export type LocalUserType = {
  image: string;
};

export type DrawerNavigatorParamList = {
  HomeScreen: undefined;
  UserSelectorScreen: undefined;
};

export type StackNavigatorParamList = {
  ChannelFilesScreen: {
    channel: Channel;
  };
  ChannelImagesScreen: {
    channel: Channel;
  };
  ChannelScreen: {
    channelId?: string;
    messageId?: string;
  };
  ChatScreen: undefined;
  GroupChannelDetailsScreen: {
    channel: Channel<
      LocalAttachmentType,
      LocalChannelType,
      LocalCommandType,
      LocalEventType,
      LocalMessageType,
      LocalReactionType,
      LocalUserType
    >;
  };
  NewDirectMessagingScreen: undefined;
  NewGroupChannelAddMemberScreen: undefined;
  NewGroupChannelAssignNameScreen: {
    selectedUsers: UserResponse<LocalUserType>[];
  };
  OneOnOneChannelDetailScreen: {
    channel: Channel<
      LocalAttachmentType,
      LocalChannelType,
      LocalCommandType,
      LocalEventType,
      LocalMessageType,
      LocalReactionType,
      LocalUserType
    >;
  };
  SharedGroupsScreen: {
    user: UserResponse<LocalUserType>;
  };
  ThreadScreen: {
    channel: Channel<
      LocalAttachmentType,
      LocalChannelType,
      LocalCommandType,
      LocalEventType,
      LocalMessageType,
      LocalReactionType,
      LocalUserType
    >;
    thread: ThreadContextValue<
      LocalAttachmentType,
      LocalChannelType,
      LocalCommandType,
      LocalEventType,
      LocalMessageType,
      LocalReactionType,
      LocalUserType
    >['thread'];
  };
};

export type BottomTabNavigatorParamList = {
  ChannelListScreen: undefined;
  MentionsScreen: undefined;
};

export type AppTheme = Theme & {
  colors: {
    background: string;
    backgroundFadeGradient: string;
    backgroundNavigation: string;
    backgroundSecondary: string;
    borderLight: string;
    danger: string;
    dateStampBackground: string;
    footnote: string;
    greyContentBackground: string;
    iconButtonBackground: string;
    success: string;
    text: string;
    textInverted: string;
    textLight: string;
    textSecondary: string;
  };
};

export type LoginConfig = {
  apiKey: string;
  userId: string;
  userName: string;
  userToken: string;
  userImage?: string;
};
