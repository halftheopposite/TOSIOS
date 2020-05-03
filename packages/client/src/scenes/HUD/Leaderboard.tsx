import { Sorts, Types } from '@tosios/common';
import React, { Fragment, CSSProperties } from 'react';
import { isMobile } from 'react-device-detect';
import { Box, Button, Inline, RoomFieldItem, Separator, Space, Text, View, Table, TableRow, TableHeader, TableCell } from '../../components';
import { IPlayer } from '../../entities/Player';
import { ArrowLeft } from '../../images/icons';

/**
 * A leaderboard of all players.
 */
export function Leaderboard(props: {
    roomName: string;
    mapName: string;
    mode: string;
    players?: IPlayer[];
}): React.ReactElement {
    const {
      roomName,
      mapName,
      mode,
      players = [],
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
        <View fullscreen backdrop flex center>
            <Box>
                <Table>
                    {/* Header */}
                    <TableRow>
                        <TableHeader>
                            <Text>#</Text>
                        </TableHeader>                
                        <TableHeader>
                            <Text>Name</Text>
                        </TableHeader>                
                        <TableHeader>
                            <Text>Kills</Text>
                        </TableHeader>                
                    </TableRow>

                    {/* Players */}
                    <PlayersList
                        players={firstList}
                    />
                </Table>
            </Box>
        </View>
    );

    // return (
    //   <View
    //     fullscreen
    //     flex
    //     center
    //     backdrop
    //     style={styles.leaderboard}
    //   >
    //     <Box
    //       style={{
    //         display: 'flex',
    //         flexDirection: 'column',
    //         width: 'fit-content',
    //       }}
    //     >
    //       {/* Header */}
    //       <View>
    //         <RoomFieldItem
    //           title="Title"
    //           content={`"${roomName}"`}
    //         />
    //         <Space size="xxs" />
    //         <RoomFieldItem
    //           title="Map"
    //           content={`"${mapName}"`}
    //         />
    //       </View>

    //       <Space size="xs" />
    //       <Separator />
    //       <Space size="xs" />

    //       {/* Leaderboard */}
    //       <View style={{ display: 'flex' }}>
    //         {isDeathmatch
    //           // Death match list
    //           ? <PlayersList players={players} />
    //           // Team death match lists
    //           : (
    //             <Fragment>
    //               <PlayersList
    //                 players={players.filter(player => player.team === 'Red')}
    //                 team="Red"
    //               />
    //               <Inline size="xs" />
    //               <Separator mode="vertical" />
    //               <Inline size="xs" />
    //               <PlayersList
    //                 players={players.filter(player => player.team === 'Blue')}
    //                 team="Blue"
    //               />
    //             </Fragment>
    //           )
    //         }
    //       </View>
    //     </Box>
    //   </View>
    // );
}

/**
 * Render the menu's footer with leave and close actions.
 */
// function MenuFooter(props: {
//   onLeave: () => void;
//   onClose: () => void;
// }): React.ReactElement {
//   const { onLeave, onClose } = props;

//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: 'space-between',
//         display: 'flex',
//         ...(isMobile && { flexDirection: 'column' }),
//       }}
//     >
//       <Button
//         icon={<ArrowLeft width={20} height={20} />}
//         title="Leave"
//         onClick={onLeave}
//         text="Leave"
//         style={{ color: 'white', width: 'fit-content' }}
//       />
//       {isMobile
//         ? <Space size="xs" />
//         : <Inline size="xs" />
//       }
//       <Button
//         title="Close"
//         onClick={onClose}
//         text="Close"
//         reversed={true}
//         style={{ width: 'fit-content' }}
//       />
//     </View>
//   );
// }

/**
 * Render a list of players.
 */
function PlayersList(props: {
  players: IPlayer[];
  team?: Types.Teams;
}): any {
  const { players, team } = props;

  return players
            .sort((a, b) => Sorts.sortNumberDesc(a.kills, b.kills))
            .map((player, index) => (
                <Fragment key={index}>
                    <PlayerListItem 
                        key={player.playerId}
                        index={index}
                        player={player}
                        team={team}
                    />
                </Fragment>
            ));
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
    // const color = team ? (team)

    return (
        <TableRow key={index}>
            <TableCell>
                <Text style={{ color: team ? team : 'black' }}>
                    {`${index + 1}`}
                </Text>
            </TableCell>
            <TableCell>
                <Text>{player.name}</Text>
            </TableCell>
            <TableCell>
                <Text>{player.kills}</Text>
            </TableCell>
        </TableRow>
    );
}

const styles: { [key: string]: CSSProperties } = {
    leaderboard: {
        padding: 16,
    },
}