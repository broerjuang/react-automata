import React from 'react'
import { State, withStateMachine } from '../src'

export const machine = {
  initial: 'idle',
  states: {
    idle: {
      on: {
        FETCH: 'fetching',
      },
    },
    fetching: {
      on: {
        SUCCESS: 'success',
        ERROR: 'error',
      },
    },
    success: {},
    error: {
      on: {
        FETCH: 'fetching',
      },
    },
  },
}

export class App extends React.Component {
  componentWillTransition(action) {
    if (action === 'FETCH') {
      fetch('https://api.github.com/users/gaearon/gists')
        .then(response => response.json())
        .then(gists => this.props.transition('SUCCESS', { gists }))
        .catch(() => this.props.transition('ERROR'))
    }
  }

  handleClick = () => {
    this.props.transition('FETCH')
  }

  render() {
    return (
      <div>
        <h1>State Machine</h1>
        <State names={['idle', 'error']}>
          <button onClick={this.handleClick}>
            {this.props.machineState === 'idle' ? 'Fetch' : 'Retry'}
          </button>
        </State>
        <State name="fetching">Loading...</State>
        <State name="success">
          <ul>
            {this.props.gists.map(gist => (
              <li key={gist.id}>{gist.description}</li>
            ))}
          </ul>
        </State>
        <State name="error">Oh, snap!</State>
      </div>
    )
  }
}

App.defaultProps = {
  gists: [],
}

export default withStateMachine(machine, { devTools: true })(App)
