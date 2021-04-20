import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import Card from './Card';
import FlipTest from './FlipTest';

const data = [
    { name: 'Group A', value: 70 },
    { name: 'Group B', value: 30 },

];
const COLORS = ['#56e2f6', '#00a0d0', '#FFBB28', '#FF8042'];

export default class Cards extends PureComponent {
    render() {
        return (
            <div className="card-shell-container">
                
            <div className="card-shell">
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            <FlipTest/>
            </div>
            </div>

        );
    }
};



