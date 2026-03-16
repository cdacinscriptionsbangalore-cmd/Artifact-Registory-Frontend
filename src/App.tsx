// import { RouterProvider } from 'react-router-dom';
// import router from './routes';

import { RouterProvider } from "react-router-dom";
import router from "./routes";
import styles from "./App.module.css";
import { AuthProvider } from "./context/AuthContext";
// import * from '@mui/styled-engine-sc' as styledEngineSC;,
import { LanguageProvider } from "./context/LanguageContext";
import CustomTranslate from "./textTranslation/CustomTranslate";
import GoogleTranslate from "./textTranslation/GoogleTranslate";


function App() {
  return (

    <div className={`${styles["root-background"]} ${styles["root-background-right"]}`}>
      <AuthProvider>
        <LanguageProvider>
          <CustomTranslate />
          {/* <GoogleTranslate/> */}
            <RouterProvider router={router} />
          {/* </CustomTranslate> */}
        </LanguageProvider>
      </AuthProvider>
    </div>
  )
}
export default App;