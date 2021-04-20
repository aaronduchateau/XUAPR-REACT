import React, { PureComponent } from 'react';
import ReactCardFlip from 'react-card-flip';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import CardFixed from './CardFixed.js'

const data = [
    { name: 'Group A', value: 70 },
    { name: 'Group B', value: 30 },

];
const COLORS = ['#56e2f6', '#00a0d0', '#FFBB28', '#FF8042'];

export default class FlipTest extends React.Component {
    constructor() {
      super();
        this.state = {
        isFlipped: false
      };
      this.handleFlip = this.handleFlip.bind(this);
    }
  
    handleFlip(e) {
      e.preventDefault();
      this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
    }
  
    render() {
      return (
        <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
          <div>
          <CardFixed handleFlip={this.handleFlip}/>
          </div>
  
          <div>
          <CardFixed handleFlip={this.handleFlip}/>
          </div>
        </ReactCardFlip>
      )
    }
  }



