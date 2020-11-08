import {
    Box,
    Button,
    GitHub,
    IListItem,
    Inline,
    Input,
    Room,
    Select,
    Separator,
    Space,
    Text,
    View,
} from '../components';
import { Constants, Types } from '@tosios/common';
import React, { Component, Fragment } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { playerImage, titleImage } from '../images';
import { Client } from 'colyseus.js';
import { Helmet } from 'react-helmet';
import { RoomAvailable } from 'colyseus.js/lib/Room';
import qs from 'querystringify';
import { useAnalytics } from '../hooks';

const MapsList: IListItem[] = Constants.MAPS_NAMES.map((value) => ({
    value,
    title: value,
}));

const PlayersCountList: IListItem[] = Constants.ROOM_PLAYERS_SCALES.map((value) => ({
    value,
    title: `${value} players`,
}));

const GameModesList: IListItem[] = Constants.GAME_MODES.map((value) => ({
    value,
    title: value,
}));

interface IProps extends RouteComponentProps {}

interface IState {
    playerName: string;
    hasNameChanged: boolean;
    isNewRoom: boolean;
    roomName: string;
    roomMap: any;
    roomMaxPlayers: any;
    mode: any;
    rooms: Array<RoomAvailable<any>>;
    timer: NodeJS.Timeout | null;
}

export default class Home extends Component<IProps, IState> {
    private client?: Client;

    constructor(props: IProps) {
        super(props);

        this.state = {
            playerName: localStorage.getItem('playerName') || '',
            hasNameChanged: false,
            isNewRoom: false,
            roomName: localStorage.getItem('roomName') || '',
            roomMap: MapsList[0].value,
            roomMaxPlayers: PlayersCountList[0].value,
            mode: GameModesList[0].value,
            rooms: [],
            timer: null,
        };
    }

    // BASE
    componentDidMount() {
        try {
            const host = window.document.location.host.replace(/:.*/, '');
            const port = process.env.NODE_ENV !== 'production' ? Constants.WS_PORT : window.location.port;
            const url = `${window.location.protocol.replace('http', 'ws')}//${host}${port ? `:${port}` : ''}`;

            this.client = new Client(url);
            this.setState(
                {
                    timer: setInterval(this.updateRooms, Constants.ROOM_REFRESH),
                },
                this.updateRooms,
            );
        } catch (error) {
            console.error(error);
        }
    }

    componentWillUnmount() {
        const { timer } = this.state;

        if (timer) {
            clearInterval(timer);
        }
    }

    // HANDLERS
    handlePlayerNameChange = (event: any) => {
        this.setState({
            playerName: event.target.value,
            hasNameChanged: true,
        });
    };

    handleNameSave = () => {
        const { playerName } = this.state;
        const analytics = useAnalytics();

        localStorage.setItem('playerName', playerName);
        this.setState({
            hasNameChanged: false,
        });

        analytics.track({ category: 'User', action: 'Rename' });
    };

    handleRoomNameChange = (event: any) => {
        const roomName = event.target.value;
        localStorage.setItem('roomName', roomName);
        this.setState({
            roomName,
        });
    };

    handleRoomClick = (roomId: string) => {
        const analytics = useAnalytics();

        analytics.track({
            category: 'Room',
            action: 'Join',
        });

        navigate(`/${roomId}`);
    };

    handleCreateRoomClick = () => {
        const { playerName, roomName, roomMap, roomMaxPlayers, mode } = this.state;
        const analytics = useAnalytics();

        const options: Types.IRoomOptions = {
            playerName,
            roomName,
            roomMap,
            roomMaxPlayers,
            mode,
        };

        analytics.track({ category: 'Game', action: 'Create' });

        navigate(`/new${qs.stringify(options, true)}`);
    };

    handleCancelRoomClick = () => {
        this.setState({
            isNewRoom: false,
        });
    };

    // METHODS
    updateRooms = async () => {
        if (!this.client) {
            return;
        }

        const rooms = await this.client.getAvailableRooms(Constants.ROOM_NAME);
        this.setState({
            rooms,
        });
    };

    // RENDER
    render() {
        return (
            <View
                flex
                center
                style={{
                    padding: 32,
                    flexDirection: 'column',
                }}
            >
                <Helmet>
                    <title>{`${Constants.APP_TITLE} - Home`}</title>
                    <meta
                        name="description"
                        content="The Open-Source IO Shooter is an open-source multiplayer game in the browser meant to be hostable, modifiable, and playable by anyone."
                    />
                </Helmet>

                <View
                    flex
                    center
                    column
                    style={{
                        width: 700,
                        maxWidth: '100%',
                    }}
                >
                    <img alt="TOSIOS" src={titleImage} />
                    <Space size="xs" />
                    <Text style={{ color: 'white', fontSize: 13 }}>
                        An open-source multiplayer game in the browser meant to be hostable, modifiable, and playable by
                        anyone.
                    </Text>
                    <Space size="xxs" />
                </View>

                <Space size="m" />
                {this.renderName()}
                <Space size="m" />
                {this.renderRoom()}
                <Space size="m" />
                <GitHub />
            </View>
        );
    }

    renderName = () => {
        return (
            <Box
                style={{
                    width: 500,
                    maxWidth: '100%',
                }}
            >
                <View flex>
                    <img src={playerImage} alt="player" width={30} />
                    <Inline size="thin" />
                    <Text>Pick your name:</Text>
                </View>
                <Space size="xs" />
                <Input
                    value={this.state.playerName}
                    placeholder="Name"
                    maxLength={Constants.PLAYER_NAME_MAX}
                    onChange={this.handlePlayerNameChange}
                />
                {this.state.hasNameChanged && (
                    <>
                        <Space size="xs" />
                        <Button title="Save" text="Save" onClick={this.handleNameSave} />
                    </>
                )}
            </Box>
        );
    };

    renderRoom = () => {
        return (
            <Box
                style={{
                    width: 500,
                    maxWidth: '100%',
                }}
            >
                {this.renderNewRoom()}
                <Space size="xxs" />
                <Separator />
                <Space size="xxs" />
                {this.renderRooms()}
                <Space size="xxs" />
            </Box>
        );
    };

    renderNewRoom = () => {
        const { isNewRoom, roomName, roomMap, roomMaxPlayers, mode } = this.state;
        const analytics = useAnalytics();

        return (
            <View
                flex
                style={{
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                }}
            >
                {!isNewRoom && (
                    <Button
                        title="Create new room"
                        text="+ New Room"
                        onClick={() => this.setState({ isNewRoom: true })}
                    />
                )}
                {isNewRoom && (
                    <View style={{ width: '100%' }}>
                        {/* Name */}
                        <Text>Name:</Text>
                        <Space size="xxs" />
                        <Input
                            placeholder="Name"
                            value={roomName}
                            maxLength={Constants.ROOM_NAME_MAX}
                            onChange={this.handleRoomNameChange}
                        />
                        <Space size="s" />

                        {/* Map */}
                        <Text>Map:</Text>
                        <Space size="xxs" />
                        <Select
                            value={roomMap}
                            values={MapsList}
                            onChange={(event: any) => {
                                this.setState({ roomMap: event.target.value });
                                analytics.track({
                                    category: 'Game',
                                    action: 'Map',
                                    label: event.target.value,
                                });
                            }}
                        />
                        <Space size="s" />

                        {/* Players */}
                        <Text>Max players:</Text>
                        <Space size="xxs" />
                        <Select
                            value={roomMaxPlayers}
                            values={PlayersCountList}
                            onChange={(event: any) => {
                                this.setState({ roomMaxPlayers: event.target.value });
                                analytics.track({
                                    category: 'Game',
                                    action: 'Players',
                                    value: event.target.value,
                                });
                            }}
                        />
                        <Space size="s" />

                        {/* Mode */}
                        <Text>Game mode:</Text>
                        <Space size="xxs" />
                        <Select
                            value={mode}
                            values={GameModesList}
                            onChange={(event: any) => {
                                this.setState({ mode: event.target.value });
                                analytics.track({
                                    category: 'Game',
                                    action: 'Mode',
                                    label: event.target.value,
                                });
                            }}
                        />
                        <Space size="s" />

                        {/* Button */}
                        <View>
                            <Button title="Create room" text="Create" onClick={this.handleCreateRoomClick} />
                            <Space size="xs" />
                            <Button title="Cancel" text="Cancel" reversed onClick={this.handleCancelRoomClick} />
                        </View>
                    </View>
                )}
            </View>
        );
    };

    renderRooms = () => {
        const { rooms } = this.state;

        if (!rooms || !rooms.length) {
            return (
                <View
                    flex
                    center
                    style={{
                        borderRadius: 8,
                        backgroundColor: '#efefef',
                        color: 'darkgrey',
                        height: 128,
                    }}
                >
                    No rooms yet...
                </View>
            );
        }

        return rooms.map(({ roomId, metadata, clients, maxClients }, index) => {
            const map = MapsList.find((item) => item.value === metadata.roomMap);
            const mapName = map ? map.title : metadata.roomMap;

            return (
                <Fragment key={roomId}>
                    <Room
                        id={roomId}
                        roomName={metadata.roomName}
                        roomMap={mapName}
                        clients={clients}
                        maxClients={maxClients}
                        mode={metadata.mode}
                        onClick={this.handleRoomClick}
                    />
                    {index !== rooms.length - 1 && <Space size="xxs" />}
                </Fragment>
            );
        });
    };
}
