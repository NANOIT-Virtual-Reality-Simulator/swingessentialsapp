import React from 'react';
import {connect} from 'react-redux';

import {Text, View, ScrollView, Keyboard, FlatList, StyleSheet, Platform} from 'react-native';
import styles, {sizes, colors, spacing, altStyles} from '../../styles/index';
import {FormInput, FormValidationMessage, Button, Header} from 'react-native-elements';
import {executePayment, checkCoupon} from '../../actions/LessonActions';
import {roundNumber} from '../../utils/utils';
import CardRow from '../Card/CardRow';
import KeyboardView from '../Keyboard/KeyboardView';
import {atob} from '../../utils/base64.js';

// import Icon from 'react-native-vector-icons/FontAwesome';

function mapStateToProps(state){
    return {
        token: state.login.token,
        packages: state.packages.list,
        coupon: state.lessons.coupon,
        purchaseInProgress: state.credits.inProgress,
        purchaseSuccess: state.credits.success,
        purchaseFail: state.credits.fail
        //username: state.userData.username,
        //lessons: state.lessons,
        //credits: state.credits
    };
}
function mapDispatchToProps(dispatch){
    return {
        checkCoupon: (code) => {dispatch(checkCoupon(code))},
        executePayment: (data, token) => {dispatch(executePayment(data,token))},
        // getCredits: (token) => {dispatch(getCredits(token))}
    };
}

class Order extends React.Component{
    constructor(props){
        super(props);
        this.state={
            selected: props.packages[0],
            coupon: '',
            role: 'pending',
            error: ''
        }
    }
    componentWillMount(){
        if(!this.props.token){
            this.props.navigation.navigate('Login');
        }
        else{
            // check if the user is allowed to purchase
            const role = JSON.parse(atob(this.props.token.split('.')[1])).role;
            if(role === 'pending'){
                this.setState({role: 'pending', error: 'You must validate your email address before you can purchase lessons'});
            }
            else{
                this.setState({role: role, error:''});
            }    
        }
    }
    componentDidMount(){
        // if(!this.props.token){
        //     this.props.navigation.navigate('Login');
        // }
    }
    componentWillReceiveProps(nextProps){
        if(!nextProps.token){
            this.props.navigation.navigate('Login');
        }
        // else if(!nextProps.lessons.loading && !nextProps.credits.inProgress){
        //     this.setState({refreshing: false});
        // }
    }
    _getTotal(){
        if(this.props.coupon.value <= 0){
            return this.state.selected.price;
        }
        else if(this.props.coupon.type === 'amount'){
            return roundNumber(Math.max(this.state.selected.price-this.props.coupon.value, 0), 2).toFixed(2);
        }
        else if(this.props.coupon.type === 'percent'){
            return roundNumber(Math.max(this.state.selected.price-(this.props.coupon.value/100)*this.state.selected.price, 0), 2).toFixed(2);
        }
        else{
            return this.state.selected.price;
        }
    }

    _checkCoupon(){
        Keyboard.dismiss();
        if(!this.state.coupon){return;}
        this.props.checkCoupon(this.state.coupon);
        this.setState({coupon: ''});
    }

    _purchaseLesson(data){
        if(this.state.role === 'pending'){
            return;
        }
        if(!data){ return;}
        
        this.props.executePayment(data,this.props.token);
    }

    render(){
        return(
            <View style={{backgroundColor: colors.backgroundGrey, flexDirection: 'column', flex: 1}}>
                <Header
                    style={{flex: 0}}
                    outerContainerStyles={{ 
                        backgroundColor: colors.lightPurple, 
                        height: Platform.OS === 'ios' ? 70 :  70 - 24, 
                        padding: Platform.OS === 'ios' ? 15 : 10
                    }}
                    innerContainerStyles={{alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center'}}
                    leftComponent={{ icon: 'menu',underlayColor:colors.transparent, color: colors.white, containerStyle:styles.headerIcon, onPress: () => this.props.navigation.navigate('DrawerOpen') }}
                    centerComponent={{ text: 'Order Lessons', style: { color: colors.white, fontSize: 18 } }}
                />
                {this.props.purchaseFail && 
                    <ScrollView style={{padding: spacing.normal}}>
                        <Text style={StyleSheet.flatten([styles.paragraph, {marginTop: 0, marginBottom: 0}])}>There was an error processing your purchase. Please try again later or contact info@swingessentials.com for more information.</Text>
                        <Button
                            title="BACK TO LESSONS"
                            onPress={()=> this.props.navigation.navigate('Lessons')}
                            buttonStyle={StyleSheet.flatten([styles.purpleButton, {marginTop: spacing.normal}])}
                            containerViewStyle={styles.buttonContainer}
                        />
                    </ScrollView>
                }
                {this.props.purchaseSuccess && 
                    <ScrollView style={{padding: spacing.normal}}>
                        <Text style={StyleSheet.flatten([styles.paragraph, {marginTop: 0, marginBottom: 0}])}>Thank you for your purchase!</Text>
                        <Button
                            title="REDEEM NOW"
                            onPress={()=> this.props.navigation.navigate('Redeem')}
                            buttonStyle={StyleSheet.flatten([styles.purpleButton, {marginTop: spacing.normal}])}
                            containerViewStyle={styles.buttonContainer}
                        />
                        <Button
                            title="BACK TO LESSONS"
                            onPress={()=> this.props.navigation.navigate('Lessons')}
                            buttonStyle={StyleSheet.flatten([styles.purpleButton, {marginTop: spacing.normal}])}
                            containerViewStyle={styles.buttonContainer}
                        />
                    </ScrollView>
                }
                {!this.props.purchaseFail && !this.props.purchaseSuccess &&
                    <KeyboardView
                        fixed={
                            <Button
                                title="COMPLETE PURCHASE"
                                disabled={this.state.role === 'pending' || this.props.purchaseInProgress}
                                disabledStyle={styles.disabledButton}
                                onPress={()=>this._purchaseLesson({
                                    id: 'N/A',
                                    payer: 'N/A',
                                    package: this.state.selected.shortcode,
                                    coupon: this.props.coupon.code,
                                    total: this._getTotal()
                                })}
                                buttonStyle={StyleSheet.flatten([styles.purpleButton, {marginTop: spacing.normal}])}
                                containerViewStyle={styles.buttonContainer}
                            />
                        }
                    >
                        <ScrollView ref={(ref) =>this.scroller=ref} 
                            keyboardShouldPersistTaps={'always'}
                        >
                            {this.state.error !== '' && 
                                <FormValidationMessage 
                                    containerStyle={StyleSheet.flatten([styles.formValidationContainer, {marginTop: 0, marginBottom: spacing.normal}])} 
                                    labelStyle={styles.formValidation}>
                                    {this.state.error}
                                </FormValidationMessage>
                            }
                            <FlatList
                                scrollEnabled= {false}
                                keyboardShouldPersistTaps = {'always'}
                                ListHeaderComponent={
                                    <View style={styles.cardHeader}>
                                        <Text style={{color: colors.white}}>Select a Package</Text>
                                    </View>
                                }
                                data={this.props.packages}
                                renderItem={({item, index}) => 
                                    <CardRow 
                                        primary={item.name} 
                                        subtitle={item.description}
                                        secondary={`$${item.price}`}
                                        action={this.props.purchaseInProgress ? null : ()=>this.setState({selected: item})}
                                        menuItem
                                        selected={this.state.selected.shortcode === item.shortcode}
                                    />
                                }
                                keyExtractor={(item, index) => item.id}
                            />
                            <FlatList
                                style={{marginTop: spacing.normal}}
                                scrollEnabled= {false}
                                keyboardShouldPersistTaps = {'always'}
                                ListHeaderComponent={
                                    <View style={styles.cardHeader}>
                                        <Text style={{color: colors.white}}>Discount Code</Text>
                                    </View>
                                }
                                data={[{id: 1}]}
                                renderItem={({item, index}) => 
                                    <View style={{flexDirection: 'row', height: sizes.normal, marginTop: spacing.small}}>
                                        <FormInput
                                            autoCapitalize={'none'}
                                            onFocus= {() => this.scroller.scrollTo({x: 0, y: 150, animated: true})}
                                            disabled={this.props.purchaseInProgress}
                                            containerStyle={StyleSheet.flatten([styles.formInputContainer, {flex: 1}])}
                                            inputStyle={styles.formInput}
                                            underlineColorAndroid={colors.transparent}
                                            value={this.state.coupon}
                                            onChangeText={(text)=>this.setState({coupon: text})}
                                        />
                                        <Button
                                            title="APPLY"
                                            disabled={!this.state.coupon || this.props.purchaseInProgress}
                                            onPress={()=> {this._checkCoupon()}}
                                            buttonStyle={StyleSheet.flatten([styles.purpleButton, {marginTop: 0}])}
                                            disabledStyle={styles.disabledButton}
                                            containerViewStyle={StyleSheet.flatten([styles.buttonContainer, {marginRight: 0, width: 'auto'}])}
                                        />
                                    </View>
                                }
                                keyExtractor={(item, index) => item.id}
                            />
                            {this.props.coupon.error !== '' && 
                                <FormValidationMessage 
                                    containerStyle={StyleSheet.flatten([styles.formValidationContainer, {marginTop: spacing.normal}])} 
                                    labelStyle={styles.formValidation}>
                                    {this.props.coupon.error}
                                </FormValidationMessage>
                            }
                            <FlatList
                                style={{marginTop: spacing.normal}}
                                scrollEnabled= {false}
                                keyboardShouldPersistTaps = {'always'}
                                ListHeaderComponent={
                                    <View style={styles.cardHeader}>
                                        <Text style={{color: colors.white}}>Order Details</Text>
                                    </View>
                                }
                                data={[
                                    {primary: 'Sub-total', secondary: `$${this.state.selected.price}`},
                                    ...(this.props.coupon.value > 0 ? [{
                                        primary: 'Discount', 
                                        subtitle: (this.props.coupon.type === 'amount' ? '$' : '') + this.props.coupon.value +
                                            (this.props.coupon.type === 'percent' ? '% off' : ' off'), 
                                        secondary: '-$'+roundNumber(this.state.selected.price - this._getTotal(), 2).toFixed(2)
                                    }] : []),
                                    {primary: 'Tax', secondary: '$0.00'},
                                    {primary: 'Total', secondary: '$'+this._getTotal()}
                                ]}
                                renderItem={({item, index}) => 
                                    <CardRow 
                                        primary={item.primary} 
                                        subtitle={item.subtitle}
                                        secondary={item.secondary}
                                    />
                                }
                                keyExtractor={(item, index) => index}
                            />
                        </ScrollView>    
                    </KeyboardView> 
                }           
            </View>

        );
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Order);