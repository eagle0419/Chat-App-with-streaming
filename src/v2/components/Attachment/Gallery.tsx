import React, { useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Immutable, isImmutable } from 'seamless-immutable';

import { CloseButton } from '../CloseButton/CloseButton';

import { useMessageContentContext } from '../../contexts/messageContentContext/MessageContentContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../contexts/translationContext/TranslationContext';
import { makeImageCompatibleUrl } from '../../utils/utils';

import type { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import type { Attachment } from 'stream-chat';

import type { Alignment } from '../../contexts/messagesContext/MessagesContext';
import type { DefaultAttachmentType, UnknownType } from '../../types/types';

const styles = StyleSheet.create({
  galleryContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 30,
    justifyContent: 'center',
    marginRight: 32,
    marginTop: 32,
    width: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    width: '100%',
    zIndex: 1000,
  },
  single: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 200,
    overflow: 'hidden',
  },
});

type GalleryHeaderProps = {
  handleDismiss: ((event: GestureResponderEvent) => void) | undefined;
};

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ handleDismiss }) => {
  const {
    theme: {
      message: {
        gallery: {
          header: { button, container },
        },
      },
    },
  } = useTheme();

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  return (
    <View style={[styles.headerContainer, container]}>
      <TouchableOpacity
        onPress={handleDismiss}
        style={[styles.headerButton, button]}
      >
        <CloseButton />
      </TouchableOpacity>
    </View>
  );
};

GalleryHeader.displayName = 'GalleryHeader{message{gallery{header}}}';

export type GalleryProps<At extends UnknownType = DefaultAttachmentType> = {
  /**
   * Position of the message, either 'right' or 'left'
   */
  alignment: Alignment;
  /**
   * The image attachments to render
   */
  images: Attachment<At>[];
};

/**
 * UI component for card in attachments.
 *
 * @example ./Gallery.md
 */
export const Gallery = <At extends UnknownType = DefaultAttachmentType>(
  props: GalleryProps<At>,
) => {
  const { alignment, images } = props;
  const {
    theme: {
      message: {
        gallery: {
          doubleSize,
          galleryContainer,
          halfSize,
          imageContainer,
          single,
          size,
          width,
        },
      },
    },
  } = useTheme();

  const { additionalTouchableProps, onLongPress } = useMessageContentContext();
  const { t } = useTranslationContext();

  const [viewerModalImageIndex, setViewerModalImageIndex] = useState(0);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);

  if (!images?.length) return null;

  const immutableGalleryImages = images.reduce((returnArray, currentImage) => {
    const url = currentImage.image_url || currentImage.thumb_url;
    if (url) {
      returnArray.push({ url: makeImageCompatibleUrl(url) } as Immutable<
        IImageInfo
      >);
    }
    return returnArray;
  }, [] as Immutable<IImageInfo>[]);

  const galleryImages: IImageInfo[] = [];

  immutableGalleryImages.forEach((image) => {
    const galleryImage = isImmutable(image) ? image.asMutable() : image;
    galleryImages.push(galleryImage);
  });

  if (galleryImages.length === 1) {
    return (
      <>
        <TouchableOpacity
          onLongPress={onLongPress}
          onPress={() => setViewerModalOpen(true)}
          style={[
            styles.single,
            {
              borderBottomLeftRadius: alignment === 'right' ? 16 : 2,
              borderBottomRightRadius: alignment === 'left' ? 16 : 2,
              width,
            },
            single,
          ]}
          testID='image-attachment-single'
          {...additionalTouchableProps}
        >
          <Image
            resizeMode='cover'
            source={{ uri: galleryImages[0].url }}
            style={{ flex: 1 }}
          />
        </TouchableOpacity>
        {viewerModalOpen && (
          <Modal
            onRequestClose={() => setViewerModalOpen(false)}
            transparent
            visible
          >
            <ImageViewer
              // TODO: We don't have 'save image' functionality.
              // Until we do, lets disable this feature. saveToLocalByLongPress prop basically
              // opens up popup menu to with an option "Save to the album", which basically does nothing.
              enableSwipeDown
              imageUrls={galleryImages}
              onCancel={() => setViewerModalOpen(false)}
              renderHeader={() => (
                <GalleryHeader
                  handleDismiss={() => setViewerModalOpen(false)}
                />
              )}
              saveToLocalByLongPress={false}
              useNativeDriver
            />
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <View
        style={[
          styles.galleryContainer,
          {
            borderBottomLeftRadius: alignment === 'right' ? 16 : 2,
            borderBottomRightRadius: alignment === 'left' ? 16 : 2,
            height:
              galleryImages.length >= 4
                ? doubleSize
                : galleryImages.length === 3
                ? halfSize
                : size,
            width,
          },
          galleryContainer,
        ]}
        testID='image-multiple-container'
      >
        {galleryImages.slice(0, 4).map((image, i) => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={`gallery-item-${i}`}
            onLongPress={onLongPress}
            onPress={() => {
              setViewerModalOpen(true);
              setViewerModalImageIndex(i);
            }}
            style={[
              {
                height: galleryImages.length !== 3 ? size : halfSize,
                width: galleryImages.length !== 3 ? size : halfSize,
              },
              imageContainer,
            ]}
            testID='image-multiple'
            {...additionalTouchableProps}
          >
            {i === 3 && galleryImages.length > 4 ? (
              <View style={{ flex: 1 }}>
                <Image
                  resizeMode='cover'
                  source={{ uri: galleryImages[i].url }}
                  style={{ flex: 1, opacity: 0.5 }}
                />
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { alignItems: 'center', justifyContent: 'center' },
                  ]}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#000000B0',
                      borderRadius: 20,
                      height: '40%',
                      justifyContent: 'center',
                      width: '90%',
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}
                    >
                      +
                      {t('{{ imageCount }} more', {
                        imageCount: galleryImages.length - i,
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Image
                resizeMode='cover'
                source={{ uri: image?.url }}
                style={{ flex: 1 }}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      {viewerModalOpen && (
        <Modal
          onRequestClose={() => setViewerModalOpen(false)}
          transparent
          visible
        >
          <ImageViewer
            // TODO: We don't have 'save image' functionality.
            // Until we do, lets disable this feature. saveToLocalByLongPress prop basically
            // opens up popup menu to with an option "Save to the album", which basically does nothing.
            enableSwipeDown
            imageUrls={galleryImages}
            index={viewerModalImageIndex}
            onCancel={() => setViewerModalOpen(false)}
            renderHeader={() => (
              <GalleryHeader handleDismiss={() => setViewerModalOpen(false)} />
            )}
            saveToLocalByLongPress={false}
            useNativeDriver
          />
        </Modal>
      )}
    </>
  );
};

Gallery.displayName = 'Gallery{message{gallery}}';
