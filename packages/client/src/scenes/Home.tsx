import { navigate, RouteComponentProps } from '@reach/router';
import { Constants, Maps } from '@tosios/common';
import { Client } from 'colyseus.js';
import { RoomAvailable } from 'colyseus.js/lib/Room';
import qs from 'querystringify';
import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';

import Box from '../components/Box';
import Button from '../components/Button';
import Input from '../components/Input';
import Room from '../components/Room';
import Select from '../components/Select';
import Separator from '../components/Separator';
import Space from '../components/Space';
import View from '../components/View';

interface IProps extends RouteComponentProps {
}

interface IState {
  name: string;
  hasNameChanged: boolean;
  isNewRoom: boolean;
  roomName: string;
  roomMap: string;
  roomPassword: string;
  rooms: RoomAvailable[];
  timer: any;
}

class Home extends Component<IProps, IState> {

  client: Client | null = null;

  state: IState = {
    name: localStorage.getItem('name') || '',
    hasNameChanged: false,
    isNewRoom: false,
    roomName: '',
    roomMap: Maps.List[0].value,
    roomPassword: '',
    rooms: [],
    timer: null,
  };

  // BASE
  componentDidMount() {
    const host = window.document.location.host.replace(/:.*/, '');
    const url = `${window.location.protocol.replace(/http|https/i, 'ws')}//${host}:${Constants.WS_PORT}`;

    this.client = new Client(url);

    this.setState({
      timer: setInterval(this.updateRooms, Constants.ROOM_REFRESH),
    }, this.updateRooms);
  }

  componentWillUnmount() {
    const {
      timer,
    } = this.state;

    if (this.client) {
      this.client.close();
    }

    if (timer) {
      clearInterval(timer);
    }
  }


  // HANDLERS
  handleNameChange = (event: any) => {
    this.setState({
      name: event.target.value,
      hasNameChanged: true,
    });
  }

  handleNameSave = () => {
    const { name } = this.state;
    localStorage.setItem('name', name);
    this.setState({
      hasNameChanged: false,
    });
  }

  handleRoomClick = (roomId: string) => {
    navigate(`/${roomId}`);
  }

  handleCreateRoomClick = () => {
    const {
      roomName,
      roomMap,
      roomPassword,
    } = this.state;

    navigate(`/new${qs.stringify({
      name: roomName,
      map: roomMap,
      password: roomPassword,
    }, true)}`);
  }


  // METHODS
  updateRooms = () => {
    if (!this.client) {
      return;
    }

    this.client.getAvailableRooms(Constants.ROOM_NAME, (rooms: RoomAvailable[]) =>
      this.setState({
        rooms,
      }),
    );
  }


  // RENDER
  render() {
    return (
      <View
        flex={true}
        center={true}
        style={{
          padding: 32,
          flexDirection: 'column',
        }}
      >
        <Helmet>
          <title>{Constants.APP_TITLE}</title>
        </Helmet>

        <View flex={true} center={true}>
          <h1 style={{ color: 'white' }}>
            {Constants.APP_TITLE}
          </h1>
        </View>

        <Space size="m" />
        {this.renderName()}
        <Space size="m" />
        {this.renderRoom()}
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
        <p>Pick your name:</p>
        <Space size="xs" />
        <Input
          value={this.state.name}
          placeholder="Name"
          maxLength={Constants.NAME_SIZE_MAX}
          onChange={this.handleNameChange}
        />
        {this.state.hasNameChanged && (
          <Fragment>
            <Space size="xs" />
            <Button
              title="Save"
              onClick={this.handleNameSave}
              text={'Save'}
            />
          </Fragment>
        )}
      </Box>
    );
  }

  renderRoom = () => {
    return (
      <Box
        style={{
          width: 500,
          maxWidth: '100%',
        }}
      >
        <p>Create or select a room:</p>
        <Space size="xs" />
        {this.renderNewRoom()}
        <Space size="xxs" />
        <Separator />
        <Space size="xxs" />
        {this.renderRooms()}
        <Space size="xxs" />
      </Box>
    );
  }

  renderNewRoom = () => {
    const {
      isNewRoom,
      roomName,
      roomMap,
    } = this.state;
    return (
      <View
        flex={true}
        style={{
          alignItems: 'flex-start',
          flexDirection: 'column',
        }}
      >
        {!isNewRoom && (
          <Button
            title="Create new room"
            onClick={() => this.setState({ isNewRoom: true })}
            text={'+ New Room'}
          />
        )}
        {isNewRoom && (
          <View flex={true} style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
            <Space size="xxs" />
            <Separator />
            <Space size="xxs" />
            <p>Title:</p>
            <Space size="xxs" />
            <Input
              placeholder="Room title"
              value={roomName}
              onChange={(event: any) => this.setState({ roomName: event.target.value })}
            />
            <Space size="s" />
            <p>Map:</p>
            <Space size="xxs" />
            <Select
              value={roomMap}
              values={Maps.List}
              onChange={(event: any) => this.setState({ roomMap: event.target.value })}
            />
            <Space size="xxs" />
            <Button
              title="Create room"
              onClick={this.handleCreateRoomClick}
              text={'Create'}
            />
          </View>
        )}
      </View>
    );
  }

  renderRooms = () => {
    const {
      rooms,
    } = this.state;

    if (!rooms || !rooms.length) {
      return (
        <View
          flex={true}
          center={true}
          style={{
            borderRadius: 8,
            backgroundColor: '#efefef',
            color: 'darkgrey',
            height: 128,
          }}
        >
          {'No rooms yet...'}
        </View>
      );
    }

    const list = rooms.map(({ roomId, metadata, clients, maxClients }, index) => (
      <Fragment key={roomId}>
        <Room
          id={roomId}
          roomName={metadata.roomName}
          roomMap={metadata.roomMap}
          isPrivate={metadata.isPrivate}
          clients={clients}
          maxClients={maxClients}
          onClick={this.handleRoomClick}
        />
        {(index !== rooms.length - 1) && <Space size="xxs" />}
      </Fragment>
    ));

    return list;
  }
}

export default Home;
