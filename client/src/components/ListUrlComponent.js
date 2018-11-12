/*eslint react/jsx-filename-extension: 0 */
/*eslint react/prop-types: 0 */

import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import CheckCircle from '@material-ui/icons/CheckCircle';
import HomePageComponent from './HomePageComponent';
import '../styles/ListUrlComponent.css';
// import * as Rx from 'rxjs-compat';
import moment from 'moment';

class ListUrlComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listdata: []
    };
  }

  componentWillMount() {
    fetch('/apps').then(data => data.json())
      .then(r => {
        console.log("response from /apps route ", r);
        this.setState({ listdata: r });
      })

    this.setState({ // to re-render the component
    });
    // Rx.Observable.fromPromise(fetch('/apps')
    //   .then(res => { res.json() })).subscribe(r => console.log("r in subscribe : ",r))
  }

  render() {
    //const { classes } = this.props;
    // const data = ['css', 'html', 'javascript', 'nodejs'];
    const { listdata } = this.state;
    listdata.forEach(ele =>{
      console.log("ele : ",ele);
      ele.timestamp = moment(ele.timestamp).format('MMMM Do YYYY, h:mm:ss a');
    })
    return (
      <div>
        <HomePageComponent />
        {listdata.map((x) =>
        // {data.map((x) =>
          <div className="root">
            <Card className="card">
              <CardHeader
                avatar={
                  <Avatar aria-label="Recipe" className="avatar">
                    <CheckCircle className="checkCircle" />
                  </Avatar>
                }
                // title={x}
                title={x.app_name}
                // subheader="September 14, 2016"
                subheader={x.timestamp}
              />
            </Card>
          </div>
        )
        }
      </div>
    );
  }
}
export default (ListUrlComponent);

