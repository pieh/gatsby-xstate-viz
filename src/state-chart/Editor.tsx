import React, { Component } from "react"
import AceEditor from "react-ace"
import "brace/theme/monokai"
import "brace/mode/javascript"
import { StyledButton } from "./Button"
import styled from "styled-components"

interface EditorProps {
  code: string
  onChange?: (code: string) => void
  onCodeChange?: (code: string) => void
  height?: number | string
  changeText?: string
}

const StyledEditor = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem 0 0 1rem;
`

export class Editor extends Component<EditorProps> {
  state = {
    code: this.props.code,
  }
  render() {
    const { code } = this.state
    const {
      onChange,
      onCodeChange,
      height = "100%",
      changeText = "Update",
      style = {},
    } = this.props

    return (
      <StyledEditor style={style}>
        <AceEditor
          mode="javascript"
          theme="monokai"
          editorProps={{ $blockScrolling: true }}
          value={code}
          onChange={value => {
            this.setState({ code: value })
            if (onCodeChange) {
              onCodeChange(value)
            }
          }}
          setOptions={{ tabSize: 2, fontSize: "10px" }}
          width="100%"
          height={height as string}
          showGutter={false}
          readOnly={!onChange}
          commands={[
            {
              name: "run",
              bindKey: {
                mac: "Shift+enter",
              },
              exec: () => {
                if (onChange) {
                  onChange(this.state.code)
                }
                // console.log("key bind")
              },
            },
          ]}
        />

        {onChange ? (
          <StyledButton onClick={() => onChange(this.state.code)}>
            {changeText}
          </StyledButton>
        ) : null}
      </StyledEditor>
    )
  }
}
