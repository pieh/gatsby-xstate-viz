import React, { useState, useEffect } from "react"
import { StateChart, Editor, StyledButton } from "../state-chart"
import styled from "styled-components"
import {
  services as initialServices,
  onNewService,
  getService,
} from "../utils/services"

import debounce from "lodash.debounce"

import "../machines/init"
import "./index.css"

const StateChartsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0.5rem;
`

const FlexItem = styled.div`
  flex: 1 1 800px;
`

const FlexDummyItem = styled(FlexItem)`
  margin: 0 0.5rem;
`

const DummyItems = Array(5)
  .fill(0)
  .map((val, index) => <FlexDummyItem key={`dummy ${index}`} />)

const StyledStateChart = styled(FlexItem)`
  margin: 0.5rem;
  border: 1px solid var(--color-border);
`

const StateChartWrapper = props => (
  <StyledStateChart>{StateChart && <StateChart {...props} />}</StyledStateChart>
)

function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item =
        typeof window !== `undefined` && window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== `undefined`) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

let counter = 1
const AddPageButton = ({ componentPath }) => (
  <StyledButton
    small
    onClick={() => {
      const path = `/page-${counter}`
      getService({
        id: path,
        type: `page`,
        args: {
          path,
          componentPath,
        },
      })
      counter++
    }}
  >
    Add page using "{componentPath}"
  </StyledButton>
)

const Wrapper = styled.div`
  position: relative;
`

const BottomPane = styled.div`
  background: var(--color-sidebar);
  padding-top: 0.5em;
  // position: sticky;
  bottom: 0;
  display: flex;
  height: 300px;
  z-index: 999;

  :before {
    content: "";
    display: block;
    position: absolute;
    bottom: 100%;
    height: 0.5rem;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.5);
  }
`

const BottomPaneButtons = styled.div`
  flex: 0 1 500px;
  display: flex;

  flex-direction: column;
`

// const BottomPaneEditor = styled(Editor)`
//   flex: 1 1 600px;
//   height: 400px;
//   padding: 0;
// `

if (typeof window !== `undefined`) {
  window.getService = getService
}

const defaultEditorCode = `// available commands
// getService

const schemaCreated = () => getService(\`query-extractor\`).send(\`SCHEMA_CREATED\`)
const getPageComponentService = pageComponent => getService({ type: \`page-component\`, id: pageComponent })

getPageComponentService(\`template-A\`).send(\`QUERY_EXTRACTION_BABEL_ERROR\`)
`
export default () => {
  if (typeof window === `undefined`) {
    return null
  }

  const [services, setServices] = useState(initialServices)
  const [code, setCode] = useLocalStorage(`code`, defaultEditorCode)

  useEffect(() => {
    const unsubscribe = onNewService(updatedServices => {
      setServices({ ...updatedServices })
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Wrapper
      style={{
        "--color-app-background": "#FFF",
        "--color-border": "#dedede",
        "--color-primary": "rgba(87, 176, 234, 1)",
        "--color-primary-faded": "rgba(87, 176, 234, 0.5)",
        "--color-primary-shadow": "rgba(87, 176, 234, 0.1)",
        "--color-link": "rgba(87, 176, 234, 1)",
        "--color-disabled": "#c7c5c5",
        "--color-edge": "rgba(0, 0, 0, 0.2)",
        "--color-secondary": "rgba(255,152,0,1)",
        "--color-secondary-light": "rgba(255,152,0,.5)",
        "--color-sidebar": "#272722",
        "--radius": "0.2rem",
        "--border-width": "2px",
      }}
    >
      <StateChartsContainer>
        {Object.entries(services).map(([serviceID, serviceDescription]) => {
          return (
            <StateChartWrapper
              key={serviceID}
              serviceID={serviceDescription.id}
              machine={serviceDescription.machine}
              service={serviceDescription.service}
            />
          )
        })}
        {DummyItems}
      </StateChartsContainer>
      <BottomPane>
        <BottomPaneButtons>
          <AddPageButton componentPath="template-A" />
          <AddPageButton componentPath="template-B" />
        </BottomPaneButtons>
        <Editor
          changeText={`Execute`}
          style={{ padding: 0, backgroundColor: `var(--color-sidebar)` }}
          code={code}
          onCodeChange={debounce(code => {
            setCode(code)
          }, 500)}
          onChange={code => {
            try {
              const wrappedCode = `
                const fn = async () => { ${code} }
                fn()
              `
              // eslint-disable-next-line
              eval(wrappedCode)
            } catch (e) {
              console.log(`eval error`, e)
            }
          }}
        />
      </BottomPane>
    </Wrapper>
  )
}
