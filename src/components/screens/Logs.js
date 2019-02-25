import React from 'react';
import {connect} from 'react-redux';

import { 
  Alert, 
  View, 
  Text,
  StyleSheet
} from 'react-native';
import {Button} from 'react-native-elements';
import Mailer from 'react-native-mail';

import Header from '../Header/Header';
import KeyboardView from '../Keyboard/KeyboardView';

import styles, {colors, spacing} from '../../styles/index';
import {scale} from '../../styles/dimension';

import { formatText, logLocalError, clearErrorLog } from '../../utils/utils';

var RNFS = require('react-native-fs');
const path = RNFS.DocumentDirectoryPath + '/error.txt';

function mapStateToProps(state){
  return {
    token: state.login.token
  };
}
function mapDispatchToProps(dispatch){
  return {
  };
}

class LogsScreen extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      content: '',
      refreshing: false
    };
    RNFS.exists(path)
    .then((exists) => {
      if(exists){
        this.readErrorLog();
      }
    });
  }

  readErrorLog(){
    return RNFS.readFile(path, 'utf8')
    .then((content) => {
      this.setState({content: content});
    })
    .catch(err => {
      //alert('error');
    })
  }
  refresh(){
    this.setState(
      {refreshing: true}, 
      () => this.readErrorLog().then(() => this.setState({refreshing: false}))
    )
  }

  sendErrorMail(){
    Mailer.mail({
      subject: 'Swing Essentials Error Report',
      recipients: ['boyle.p.joseph@gmail.com'],
      body: 'My Swing Essentials app has been encountering errors. Please see the attached error log.',
      isHTML: false,
      attachment: {
        path: path,
        type: 'doc',
        name: 'ErrorLog.txt'
      }
    }, (error, event) => {
      if(error){
        logLocalError('Error sending error report: ' + error);
      }
      else if(event && event === 'sent'){
        // message sent successfully
        clearErrorLog();
        Alert.alert(
          'Error Report Sent',
          'Your error report has been submitted successfully. Thank you for helping us improve the app!',
          [{text: 'DONE', onPress: () => this.refresh()}]
        );
      }
      else if(event && event === 'canceled'){
        logLocalError('Error sending error report: ' + event);
      }
      else if(event){
        logLocalError('Error sending error report: ' + event);
      }
    });
  }
  render(){
    return (
      <View style={{backgroundColor: colors.backgroundGrey, flexDirection: 'column', flex: 1}}>
        <Header type="refresh" onRefresh={() => this.refresh()} title={'Error Log'} navigation={this.props.navigation}/>
        <KeyboardView
          onRefresh={() => this.refresh()}
          refreshing={this.state.refreshing}
          fixed={
            <Button
                title={'SEND ERROR REPORT'}
                fontSize={scale(14)}
                disabled={this.state.content.length < 1}
                disabledStyle={styles.disabledButton}
                onPress={() => this.sendErrorMail()}
                buttonStyle={StyleSheet.flatten([styles.purpleButton, {marginTop: spacing.normal}])}
                containerViewStyle={styles.buttonContainer}
            /> 
          }
        >
          <View contentContainerStyle={{alignItems: 'stretch'}}>            
            {formatText(this.state.content)}
            {this.state.content.length < 1 &&
              <Text style={StyleSheet.flatten([styles.paragraph, {fontSize: 36, textAlign: 'center'}])}>No Logs Since Last Report</Text>
            }
          </View>
        </KeyboardView>
      </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogsScreen);
