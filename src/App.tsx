import FlameGraph from './components/flame-chart';
import Header from './components/header'
import Samples from './components/samples'
import styled from 'styled-components'
import {useEffect, useState} from 'react';
import EditorTest from './test-data/editorTest.json'
import PauseFunc from './test-data/pauseFunc.json'
import {initJSONSamples} from './utils/samples';
function App() {
  const [JSONSamples, setJSONSamples] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const ans: any = initJSONSamples([PauseFunc, EditorTest])
    setJSONSamples(ans)
  }, [])

  return (
    <AppContainer>
      <Header setList={setJSONSamples} list={JSONSamples} />
      <Samples list={JSONSamples} onSetListIndex={setCurrentIndex} currentIndex={currentIndex} />
      {
        JSONSamples.length && <FlameGraph currentSamples={JSONSamples[currentIndex]} currentIndex={currentIndex} />
      }
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  min-width: 400px;
  padding: 0 20px;
  margin: 0 auto;
`
