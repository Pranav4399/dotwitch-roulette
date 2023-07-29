import { useEffect, useState } from 'react';
import './App.css';
import ClipLoader from "react-spinners/ClipLoader";
import ISO6391 from 'iso-639-1';

const App = () => {
  const [streams, setStreams] = useState([]);
  const [containerLoaded, setcontainerLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(()=> {
    if(window.innerWidth > 767) setIsMobile(false);
    else if(window.innerWidth < 767) setIsMobile(true);
  }, []);

  const validate = async () => {
    setStreams([])
    setcontainerLoaded(false)
    setShowLoader(true);
    try{
      const response = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: {
          'Authorization': process.env.REACT_APP_AUTHORIZATION
        }
      });
      const data = await response.json();
      if(data.hasOwnProperty('client_id'))  {
          var streamData = await getStreams();
          if (streamData.twitchStreamData.length !== 0) pushToArray(streamData);
          var after = streamData.twitchStreamCursor

          while(after) {
            streamData = await getStreams(after);
            if (streamData.twitchStreamData.length !== 0) pushToArray(streamData);
            
            if(streamData.twitchStreamCursor === after || streams.length > 10) break;
            after = streamData.twitchStreamCursor;
          }
      }
      setcontainerLoaded(true);
      setShowLoader(false);
    }
    catch (error) {
      console.error(error);
    }
  }

  const pushToArray = (streamData) => {
    //Adding streams
    setStreams(streams => [...streams, ...streamData.twitchStreamData.filter(obj => obj.viewer_count === 0)]);
  }

  const getStreams = async (after="") => {
    try{
      const res = await fetch(`https://api.twitch.tv/helix/streams?sort=views&game_id=29595&first=100&after=`+after, {
        headers: {
          'Authorization': process.env.REACT_APP_AUTHORIZATION,
          'Client-Id' : process.env.REACT_APP_CLIENT_ID
        },
        timeout: 4,
      });
      const twitchStream = await res.json();
      let twitchStreamData = twitchStream.data;
      let twitchStreamCursor = twitchStream.pagination.cursor;
      return {twitchStreamData, twitchStreamCursor}
    }
    catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className='title'>DØTwitch Roulette</div>
        <span className='subText'>Inspired from <a href='https://twitchroulette.net/' className='App-link'>Twitch Roulette</a> originally created by Alan Love</span>
        <span className='subText'>Created to support Dota 2 streamers with no viewers</span>
        <span className='subText'>Made using Official Twitch APIs and the code is available <a className='App-link' href="https://github.com/Pranav4399/dotwitch-roulette" target="_blank" rel="noopener noreferrer">here</a></span>
        <button className='btnSpin' onClick={validate}>Spin</button>
        {containerLoaded ? 
        <div className='stream-container'>
        {
          
          streams.map((stream) => {
            return <div className='stream-thumbnail'>
              <a href={'https://www.twitch.tv/' + stream.user_name} className="stream-link" target="_blank" rel="noopener noreferrer">
                <img 
                  src={isMobile ? stream.thumbnail_url.replace('{width}x{height}', '300x150') : stream.thumbnail_url.replace('{width}x{height}', '400x200')}
                  alt={stream.user_name}
                />
                <div className='stream-link-container'>{stream.user_name + " (" +ISO6391.getName(stream.language)+ ")"}</div>
              </a>
              </div>
          })
        }
        </div>
        : <ClipLoader size={25} loading={showLoader} />}
      </header>
    </div>
  );
}

export default App;
