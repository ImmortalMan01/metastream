import React, { Component } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'

import { IAppState } from '../../reducers'
import { IMediaItem } from '../../lobby/reducers/mediaPlayer'
import {
  getCurrentMedia,
  getMediaQueue,
  hasPlaybackPermissions,
} from '../../lobby/reducers/mediaPlayer.helpers'
import {
  server_requestDeleteMedia,
  server_requestMoveToTop,
  server_requestToggleQueueLock,
} from '../../lobby/actions/mediaPlayer'

import { IconButton } from '../common/button'
import { ListOverlay } from './ListOverlay'

import MenuItem from '@material-ui/core/MenuItem'
import { MediaItem } from '../media/MediaItem'
import { localUser } from 'network'
import { copyMediaLink, openMediaInBrowser } from '../../media/utils'
import { withNamespaces, WithNamespaces } from 'react-i18next'
import { sendMediaRequest } from 'lobby/actions/media-request'
import { setSetting } from 'actions/settings'
import { addFavorite } from 'reducers/favorites'

interface IProps {
  className?: string
  collapsible?: boolean
  onShowInfo(media?: IMediaItem): void
  onOpenMediaBrowser(): void
}

interface IConnectedProps {
  hasPlaybackPermissions: boolean
  currentMedia?: IMediaItem
  mediaQueue: IMediaItem[]
  mediaQueueLocked: boolean
  collapsed: boolean
}

interface DispatchProps {
  moveToTop(mediaId: string): void
  sendMediaRequest(url: string): void
  deleteMedia(mediaId: string): void
  toggleQueueLock(): void
  toggleCollapsed(): void
  addFavorite(media: IMediaItem): void
}

type Props = IProps & IConnectedProps & DispatchProps & WithNamespaces

class _MediaList extends Component<Props> {
  private listOverlay: ListOverlay<IMediaItem> | null = null

  private get mediaList() {
    const { currentMedia, mediaQueue } = this.props
    return currentMedia && currentMedia.hasMore ? [currentMedia, ...mediaQueue] : mediaQueue
  }

  render(): JSX.Element | null {
    const { t } = this.props
    return (
      <ListOverlay
        ref={(e: any) => (this.listOverlay = e)}
        id="mediaqueue"
        className={cx(this.props.className, { collapsed: this.props.collapsed })}
        title={t('nextUp')}
        tagline={this.props.mediaQueue.length ? `${this.props.mediaQueue.length}` : undefined}
        action={
          <>
            {this.renderQueueLock()}
            {this.renderAddMedia()}
          </>
        }
        onTitleClick={this.props.collapsible ? this.props.toggleCollapsed : undefined}
        renderMenuOptions={(media: IMediaItem, close) => {
          let items = [
            {
              label: t('openInBrowser'),
              onClick: () => openMediaInBrowser(media),
            },
            {
              label: t('copyLink'),
              onClick: () => copyMediaLink(media),
            },
          ]

          if (media.description) {
            items = [
              ...items,
              {
                label: t('info'),
                onClick: () => this.props.onShowInfo(media),
              },
            ]
          }

          if (this.props.hasPlaybackPermissions) {
            items = [
              ...items,
              {
                label: t('moveToTop'),
                onClick: () => this.props.moveToTop(media.id),
              },
              {
                label: t('addFavorite'),
                onClick: () => this.props.addFavorite(media),
              },
              {
                label: t('duplicate'),
                onClick: () => this.props.sendMediaRequest(media.requestUrl),
              },
              {
                label: t('remove'),
                onClick: () => this.props.deleteMedia(media.id),
              },
            ]
          }

          return items.map((item, idx) => (
            <MenuItem
              key={idx}
              onClick={() => {
                item.onClick()
                close()
              }}
              dense
            >
              {item.label}
            </MenuItem>
          ))
        }}
      >
        {this.props.collapsible && this.props.collapsed
          ? null
          : this.mediaList.map((media) => {
              return (
                <MediaItem
                  key={media.id}
                  media={media}
                  onClickMenu={(e) => {
                    this.listOverlay!.onSelect(e, media)
                  }}
                />
              )
            })}
      </ListOverlay>
    )
  }

  private renderQueueLock() {
    const { t, hasPlaybackPermissions, mediaQueueLocked: locked } = this.props
    if (!hasPlaybackPermissions && !locked) return

    const title = hasPlaybackPermissions ? t(locked ? 'unlockQueue' : 'lockQueue') : undefined

    return (
      <IconButton
        icon={locked ? 'lock' : 'unlock'}
        iconSize="small"
        title={title}
        disabled={!hasPlaybackPermissions}
        onClick={this.props.toggleQueueLock}
      />
    )
  }

  private renderAddMedia() {
    const { t, mediaQueueLocked, hasPlaybackPermissions } = this.props

    if (!hasPlaybackPermissions && mediaQueueLocked) return

    return (
      <IconButton
        icon="plus"
        iconSize="small"
        title={t('addMedia')}
        onClick={this.props.onOpenMediaBrowser}
      />
    )
  }
}

export const MediaList = withNamespaces()(
  connect(
    (state: IAppState): IConnectedProps => ({
      hasPlaybackPermissions: hasPlaybackPermissions(state, localUser()),
      currentMedia: getCurrentMedia(state),
      mediaQueue: getMediaQueue(state),
      mediaQueueLocked: state.mediaPlayer.queueLocked,
      collapsed: !!state.settings.mediaListCollapsed,
    }),
    (dispatch): DispatchProps => ({
      moveToTop(mediaId) {
        dispatch(server_requestMoveToTop(mediaId) as any)
      },
      sendMediaRequest(url) {
        dispatch(
          sendMediaRequest({
            url,
            source: 'media-context-menu-duplicate',
          }) as any,
        )
      },
      deleteMedia(mediaId: string) {
        dispatch(server_requestDeleteMedia(mediaId) as any)
      },
      toggleQueueLock() {
        dispatch(server_requestToggleQueueLock() as any)
      },
      toggleCollapsed() {
        dispatch(setSetting('mediaListCollapsed', (collapsed) => !collapsed))
      },
      addFavorite(media) {
        dispatch(addFavorite(media))
      },
    }),
  )(_MediaList),
)
