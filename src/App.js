import React from 'react';
import './App.css';
import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

const launchesQuery = `{
  launches {
    id
    launch_success
    mission_name
    launch_date_utc
    launch_site {
      site_name
    }
    rocket {
      rocket_name
    }
    details
  }
}`;

const client = new GraphQLClient('https://api.spacex.land/graphql/');

function useGraphQL(query) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    client.request(query).then(
      data => {
        setState({ data, loading: false });
      },
      err => {
        console.error(err);
      }
    );
  }, [query]);

  return state;
}

function Header() {
  return (
    <div className="page-head">
      <h2 className="page-head-title text-center">Space X Launches</h2>
    </div>
  );
}

function Loading() {
  return (
    <div className="progress">
      <div
        className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
        role="progressbar"
        style={{ width: '100%' }}
        aria-valuenow="100"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        Loading
      </div>
    </div>
  );
}


class Comments extends React.Component {
  constructor (props) {
    super(props);

    this.state = { hasLoadedComments: false }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick () {
    this.setState(prevState => ({
      hasLoadedComments: !prevState.hasLoadedComments
    }));
  }

  render () {
    return (
      <div className="timeline-comments">
        <h3 className="timeline-comments__header" onClick={this.handleClick}>Comments {!this.state.hasLoadedComments ? '(click to load)' : ''}</h3>
      </div>
    )
  }
}

function Launches({ launches }) {
  const launchesByDate = launches.reduce((list, launch) => {
    const date = launch.launch_date_utc.slice(0, 4);
    list[date] = list[date] || [];
    list[date].push(launch);
    // debugger;
    return list;
  }, {});


  return (
    <ul data-testid="launches" className="timeline timeline-variant">
      {Object.keys(launchesByDate).map(launchDate => (
        <span key={launchDate}>
          <li className="timeline-month">{launchDate}</li>
          {launchesByDate[launchDate].map(launch => (
            <Launch key={launch.flight_number} launch={launch} />
          ))}
        </span>
      ))}
    </ul>
  );
}

class Launch extends React.Component {
  constructor (props) {
    super(props);

    this.launch = props.launch;
    this.launchIcon = this.launch.launch_success ? (
      <i className="icon mdi mdi-rocket" />
    ) : (
      <i className="icon mdi mdi-bomb" />
    );
  }

  render () {
    return (
      <li className="timeline-item timeline-item-detailed right">
        <div className="timeline-content timeline-type file">
          <div className="timeline-icon">{this.launchIcon}</div>

          <div className="timeline-header">
            <span className="timeline-autor">
              #{this.launch.id}: {this.launch.mission_name}
            </span>{' '}
            <p className="timeline-activity">
              {this.launch.rocket.rocket_name} &mdash; {this.launch.launch_site.site_name}
            </p>
            <span className="timeline-time">{this.launch.launch_date_utc.slice(0, 10)}</span>
          </div>
          <div className="timeline-summary">
            <p>{this.launch.details}</p>
          </div>
          <Comments />
        </div>
      </li>
    );
  }
}

export default function App() {
  const { data, loading } = useGraphQL(launchesQuery);

  return (
    <div>
      <Header />
      {loading ? <Loading /> : <Launches launches={data.launches} />}
    </div>
  );
}
