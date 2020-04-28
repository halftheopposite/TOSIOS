import { Sorts, Types } from '@tosios/common';
import React, { Fragment } from 'react';
import { isMobile } from 'react-device-detect';
import { Box, Button, Inline, RoomFieldItem, Separator, Space, Text, View } from '../../components';
import { IPlayer } from '../../entities/Player';
import { ArrowLeft } from '../../images/icons';

/**
 * A menu to display important room actions and informations and list players.
 */
export function Menu(props: {
    roomName: string;
    mapName: string;
    mode: string;
    players?: IPlayer[];
    onLeave: () => void;
    onClose: () => void;
}): React.ReactElement {
    const {
      roomName,
      mapName,
      mode,
      players = [],
      onLeave,
      onClose,
    } = props;
    const isDeathmatch = mode === 'deathmatch';
    const firstList: IPlayer[] = [];
    const secondList: IPlayer[] = [];
  
    players.forEach(player => {
      if (isDeathmatch) {
        firstList.push(player);
      } else {
        if (player.team === 'Red') {
          firstList.push(player);
        } else {
          secondList.push(player);
        }
      }
    });

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 'fit-content',
          }}
        >
          {/* Header */}
          <View>
            <RoomFieldItem
              title="Title"
              content={`"${roomName}"`}
            />
            <Space size="xxs" />
            <RoomFieldItem
              title="Map"
              content={`"${mapName}"`}
            />
          </View>
  
          <Space size="xs" />
          <Separator />
          <Space size="xs" />
  
          {/* Leaderboard */}
          <View style={{ display: 'flex' }}>
            {isDeathmatch
              // Death match list
              ? <PlayersList players={players} />
              // Team death match lists
              : (
                <Fragment>
                  <PlayersList
                    players={players.filter(player => player.team === 'Red')}
                    team="Red"
                  />
                  <Inline size="xs" />
                  <Separator mode="vertical" />
                  <Inline size="xs" />
                  <PlayersList
                    players={players.filter(player => player.team === 'Blue')}
                    team="Blue"
                  />
                </Fragment>
              )
            }
          </View>
  
          <Space size="xs" />
          <Separator />
          <Space size="xs" />
  
          {/* Footer */}
          <MenuFooter onLeave={onLeave} onClose={onClose} />
        </Box>
      </View>
    );
}

/**
 * Render the menu's footer with leave and close actions.
 */
function MenuFooter(props: {
  onLeave: () => void;
  onClose: () => void;
}): React.ReactElement {
  const { onLeave, onClose } = props;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        display: 'flex',
        ...(isMobile && { flexDirection: 'column' }),
      }}
    >
      <Button
        icon={<ArrowLeft width={20} height={20} />}
        title="Leave"
        onClick={onLeave}
        text="Leave"
        style={{ color: 'white', width: 'fit-content' }}
      />
      {isMobile
        ? <Space size="xs" />
        : <Inline size="xs" />
      }
      <Button
        title="Close"
        onClick={onClose}
        text="Close"
        reversed={true}
        style={{ width: 'fit-content' }}
      />
    </View>
  );
}

/**
 * Render a list of players.
 */
function PlayersList(props: {
  players: IPlayer[];
  team?: Types.Teams;
}): React.ReactElement {
  const { players, team } = props;

  return (
    <View style={{ flex: 1 }}>
      {players
        .sort((a, b) => Sorts.sortNumberDesc(a.kills, b.kills))
        .map((player, index) => <PlayerListItem key={player.playerId} index={index} player={player} team={team} />)}
    </View>
  )
}

/**
 * Render a player item.
 */
function PlayerListItem(props: {
  index: number;
  player: IPlayer;
  team?: Types.Teams;
}): React.ReactElement {
  const { index, player, team } = props;

  return (
    <View
      key={player.playerId}
      style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        opacity: player.lives > 0 ? 1.0 : 0.3
      }}
    >
      <Text style={{ color: team === 'Red' ? 'red' : 'blue' }}>
        {`[${index + 1}]`}
      </Text>
      <Inline size="xxs" />
      <Text>{`${player.name} (${player.kills} kills)`}</Text>
    </View>
  );
}

