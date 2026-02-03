// import { RouterProvider } from 'react-router-dom';
// import router from './routes';

import { RouterProvider } from "react-router-dom";
import router from "./routes";
import styles from "./App.module.css";
// import * from '@mui/styled-engine-sc' as styledEngineSC;,


function App() {
  return (
    <div className={`${styles["root-background"]} ${styles["root-background-right"]}`}>
      <RouterProvider router={router} />
    </div>
  )
}
export default App;