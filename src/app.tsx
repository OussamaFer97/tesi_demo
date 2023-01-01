import ReactDOM from 'react-dom/client';
import { ECGPlotAnimation } from './components';

function App() {
  return (
    <main>
      <h2>Hello ECG detector!</h2>
      <ECGPlotAnimation width={750} height={500} />
    </main>
  );
}

function render() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
}

render();
