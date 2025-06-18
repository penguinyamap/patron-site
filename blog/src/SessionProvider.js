import { createContext, useState,useEffect} from 'react';

const SessionContext = createContext();
const SessionProvider = (props) => {
    const [currentUser, setCurrentUser] = useState();
    //const [isLoading,setIsLoading] = useState(true);
return (
        <SessionContext.Provider value={{currentUser,setCurrentUser}}>
            {props.children}
        </SessionContext.Provider>
    );
};

export { SessionContext, SessionProvider};
