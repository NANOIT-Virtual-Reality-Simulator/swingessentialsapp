import React from 'react'
import { AppState, Alert, Text, View, ScrollView, Image, Linking } from 'react-native';
import {connect} from 'react-redux';
import {requestLogout, 
    showLogoutWarning, 
    requestDataFromToken} from '../actions/LoginActions';
import LogoutWarning from './Modal/TokenExpire';

import {colors, spacing} from '../styles/index';
import {scale, verticalScale} from '../styles/dimension';

import logo from '../images/logo-big.png';

import CardRow from './Card/CardRow';

import {atob} from '../utils/base64';


function mapStateToProps(state){
    return {
        username: state.userData.username,
        token: state.login.token,
        lessons: state.lessons.pending,
        modalWarning: state.login.modalWarning
    };
}

function mapDispatchToProps(dispatch){
    return {
        refreshData: (token) => dispatch(requestDataFromToken(token)),
        requestLogout: (token) => dispatch(requestLogout(token)),
        showLogoutWarning: (show) => dispatch(showLogoutWarning(show))
    }
}

class CustomDrawer extends React.Component {
    constructor(props){
        super(props);
        this.state={
            appState: AppState.currentState
        }
    }
    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.token && nextProps.token !== this.props.token){
            if(this.tokenTimer){clearInterval(this.tokenTimer);}
            
            this.exp = JSON.parse(atob(nextProps.token.split('.')[1])).exp;
            this.tokenTimer = setInterval(() => this._checkTokenTimeout(nextProps.token), 60*1000);
            this._checkTokenTimeout(nextProps.token);
        }
    }

    // Handle the app coming into the foreground after being backgrounded
    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active' && this.props.token) {
            this.props.refreshData(this.props.token);
        }
        this.setState({appState: nextAppState});
    }

    // Periodically checks the token timeout and will show a renew dialog if the time is < 3 minutes
    _checkTokenTimeout(token=this.props.token){
        if(!token){
            if(this.tokenTimer){clearInterval(this.tokenTimer);}
            return;
        }
        // If there are < 3 minutes left on the session, show the popup
        if(this.exp && (this.exp - Date.now()/1000 < 3*60) && (this.exp - Date.now()/1000 > 0)){
            this.props.showLogoutWarning(true);
            clearInterval(this.tokenTimer);
        }
    }
    render() {
        return (
            <View style={{flex: 1, width: '100%', backgroundColor: colors.backgroundGrey}}>
                <View style={{height:verticalScale(80), padding: spacing.normal, paddingTop: spacing.large, paddingBottom: 0, backgroundColor: colors.lightPurple}}>
                    <Image
                        //resizeMode='contain'
                        resizeMethod='resize'
                        style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                        source={logo}
                    />
                </View>
                <View style={{height: spacing.large, alignItems: 'center', justifyContent:'center', backgroundColor: colors.lightPurple}}>
                    <Text style={{fontSize: scale(14), color:colors.white, marginTop:scale(-14)}}>{this.props.username ? 'Welcome, ' + this.props.username + '!' : ''}</Text>
                </View>
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent:'space-between'}}>
                    {this.props.token && 
                        <View style={{marginTop: spacing.normal}}>
                            <CardRow menuItem primary="Your Lessons" 
                                customStyle={{borderTopWidth: scale(1)}}
                                action={() => this.props.navigation.navigate('Lessons')}/>
                            <CardRow menuItem primary="Submit Your Swing" 
                                action={() => {
                                    if(this.props.lessons.length < 1){
                                        this.props.navigation.navigate('RedeemTop');
                                    }
                                    else{
                                        Alert.alert(
                                            'Swing Analysis Pending',
                                            'You already have a swing analysis in progress. Please wait for that analysis to finish before submitting a new swing. We guarantee a 48-hour turnaround on all lessons.',
                                            [{text: 'OK'}]
                                        );
                                    }
                                }}
                            />
                            <CardRow menuItem primary="Order Lessons" 
                                action={() => this.props.navigation.navigate('Order')}/>
                        </View>
                    }
                    {!this.props.token && <View></View>}
                    <View style={{marginBottom: spacing.normal}}>
                        {/* <CardRow menuItem primary="Settings" 
                            customStyle={{borderTopWidth: 1}}
                            action={() => this.props.navigation.navigate('Settings')}/> */}
                        <CardRow menuItem primary="Sign Out" 
                                action={() => this.props.requestLogout(this.props.token)}/>
                        <CardRow menuItem primary="Help" 
                            action={() => this.props.navigation.navigate('Help')}/>
                        <CardRow menuItem primary="About" secondary="v1.1.7" 
                            action={() => this.props.navigation.navigate('About')}/>
                        {/* <CardRow menuItem primary="View Website" 
                            action={() =>Linking.openURL('https://www.swingessentials.com')}/> */}
                    </View>
                </ScrollView>
                {this.props.token && this.props.modalWarning && <LogoutWarning/>}
            </View>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomDrawer);