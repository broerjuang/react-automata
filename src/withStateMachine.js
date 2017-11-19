import React from 'react'
import PropTypes from 'prop-types'
import { Machine } from 'xstate'

const withStateMachine = config => Component => {
  class StateMachine extends React.Component {
    machine = Machine(config)

    state = {
      action: null,
      componentState: null,
      machineState: this.machine.getInitialState(),
    }

    getChildContext() {
      return { machineState: this.state.machineState }
    }

    componentDidMount() {
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect()
        this.devTools.init({ machineState: this.state.machineState })
        this.unsubscribe = this.devTools.subscribe(message => {
          if (
            message.type === 'DISPATCH' &&
            message.payload.type === 'JUMP_TO_ACTION'
          ) {
            this.setState(JSON.parse(message.state))
          }
        })
      }
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (
        this.instance.componentDidTransition &&
        prevState.machineState !== this.state.machineState &&
        this.state.action
      ) {
        this.instance.componentDidTransition(
          prevState.machineState,
          this.state.action,
          this.state.payload
        )
      }
    }

    handleRef = element => {
      this.instance = element
    }

    handleTransition = (action, payload) => {
      if (this.instance.componentWillTransition) {
        this.instance.componentWillTransition(action, payload)
      }

      this.setState(
        prevState => ({
          action,
          componentState: { ...this.state.componentState, ...payload },
          machineState: this.machine
            .transition(prevState.machineState, action)
            .toString(),
          payload,
        }),
        () => {
          if (this.devTools) {
            this.devTools.send(action, {
              componentState: this.state.componentState,
              machineState: this.state.machineState,
            })
          }
        }
      )
    }

    render() {
      return (
        <Component
          {...this.props}
          {...this.state.componentState}
          machineState={this.state.machineState}
          ref={this.handleRef}
          transition={this.handleTransition}
        />
      )
    }
  }

  StateMachine.childContextTypes = {
    machineState: PropTypes.string,
  }

  return StateMachine
}

export default withStateMachine
