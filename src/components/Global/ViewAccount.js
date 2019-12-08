import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getOtherUser, loadingStart, loadingDone } from '../../actions/AppActions.js';
import decode from 'jwt-decode';
import styled from 'styled-components';
import axiosWithAuth from '../../utils/axiosWithAuth';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faUserCircle, faCamera } from "@fortawesome/free-solid-svg-icons";
// import {faPencilAlt, faUserCircle, faCamera, faImages, faFileVideo} from "@fortawesome/free-solid-svg-icons";
import LoadingOverlay from "react-loading-overlay";

function ViewAccount(props) {
    console.log('Decoded token', decode(sessionStorage.getItem('token')));
    const [isAdmin] = useState(decode(sessionStorage.getItem('token')).admin)
    const [showEditForm, setShowEditForm] = useState(false);
    // state for when the user edits their account details
    const [editUserName, setEditUserName] = useState(props.otherUser.username);
    const [editName, setEditName] = useState(props.otherUser.name);
    const [editEmail, setEditEmail] = useState(props.otherUser.email);
    const [editCohort, setEditCohort] = useState(props.otherUser.cohort);
    const [newPassword, setNewPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [verifyPassword, setVerifyPassword] = useState('');

    console.log(props.match.params.id, props.currentUser.id)
    useEffect(() => {
        if (props.match.params.id == props.currentUser.id){
            props.history.push('/Dashboard/Account');
        }
    }, [])

    useEffect(() => {
        props.loadingStart();
        props.getOtherUser(props.match.params.id);
      }, [])

    const handleChange = e => {
        if (e.target.name === 'username'){
            setEditUserName(e.target.value);
        }
        else if (e.target.name === 'name'){
            setEditName(e.target.value);
        }
        else if (e.target.name === 'email'){
            setEditEmail(e.target.value);
        }
        else if (e.target.name === 'cohort'){
            setEditCohort(e.target.value);
        }
        else if (e.target.name === 'newPassword'){
            setNewPassword(e.target.value);
        }
      };

    const passwordChange = (e) => {
        setVerifyPassword(e.target.value)
    }

    const handleSubmit = async e => {
        const promises = [];
        e.preventDefault();
        e.target.reset();
        // console.log(JSON.stringify(props.currentUser));
        // console.log(props.currentUser.profile_picture)
        let userObj = { password: verifyPassword }
        if (editUserName){
            userObj = {...userObj, username: editUserName}
        }
        if (editName){
            userObj = {...userObj, name: editName}
        }
        if (editEmail){
            userObj = {...userObj, email: editEmail}
        }
        if (editCohort){
            userObj = {...userObj, cohort: editCohort}
        }
        if (newPassword){
            userObj = {...userObj, newPassword: newPassword}
        }
        // console.log(editUserName)
        // console.log(userObj)
        if (validateInputs()) {
            props.loadingStart();
           try{
            promises.push(axiosWithAuth().put(`users/${props.match.params.id}`, userObj));
        
            // if(profilePicture){
            //     const formData = new FormData();
            //     formData.append('image', profilePicture);
            //     console.log(profilePicture);
            //     console.log(formData);

            //     if(props.currentUser.profile_picture){
            //         promises.push(axiosWithAuth().put('https://ddq.herokuapp.com/api/users/user/picture', formData));
            //     }else{
            //         promises.push(axiosWithAuth().post('https://ddq.herokuapp.com/api/users/user/picture', formData));
            //     }
            // }
            const response = await axios.all(promises);
            props.loadingDone();
            }catch(err){
                console.log("Edit Account Catch Error: ", err.response.data.message);
                alert(err.response.data.message);
                props.loadingDone();
            }
        }
    }

    const isValidPassword = password => {
        if (password === "") {
            alert("You must enter a password.");
            return false;
        }
        if (password.length < 5 || password.length > 20) {
            alert("Password cannot be less than 5 or greater than 20 characters");
            return false;
        }
        if (!/(!|@|#|\$|&|\*|%|^)/.test(password)) {
            alert("Password must contain at least one special character");
            return false;
        }
        if (!/([A-Z])/.test(password)) {
            alert("Password must contain at least one capitalized letter");
            return false;
        }
        if (!/([0-9])/.test(password)) {
            alert("Password must contain at least one number");
            return false;
        }
        return true;
    };
      
    const validateInputs = () => {
        // if (editUserName === "") {
        //     alert("Your username can't be empty.");
        //     return false;
        // }
        if(!(/^[a-z][a-z0-9_]*$/i.test(editUserName))) {
            alert("Username must start with a letter and may only contain a-z, _, or numbers.");
            return false;
        }
        if (editName === "") {
            alert("You must enter your name.");
            return false;
    }

     // if (!isValidPassword(newPassword)) {
     //     return false;
     // }
        return true;
    };

    return (
        <OuterDiv>
        <Div className='card'> 
        <StyledLoader active={props.loading} spinner text='Uploading...'> 
            {!showEditForm && <>
                    <ProOuter>
                        <ProfileWrapper>
                            {props.otherUser.profile_picture ? (
                            <ProfileFilter>
                                <div className='editPicture'>
                                    Edit
                                    <FontAwesomeIcon icon={faCamera} className='fa-1x'/>
                                </div>
                                <ProfileImg edit={false} style={{backgroundImage: `url('${props.otherUser.profile_picture}')`}}/>
                            </ProfileFilter>) : (
                            <ProfileFilter>
                                <div className='editPicture'>
                                    Edit
                                    <FontAwesomeIcon icon={faCamera} className='fa-1x'/>
                                </div>
                                <DefaultProfile edit={false} icon={faUserCircle}/>
                            </ProfileFilter>)}
                        </ProfileWrapper>
                    </ProOuter>
                <h3 className="bold">Username:</h3><p>{props.otherUser.username}</p>
                <h3 className="bold">Name:</h3><p>{props.otherUser.name}</p>
                <h3 className="bold">Email:</h3><p>{props.otherUser.email !== null ? props.otherUser.email : 'None'}</p>
                <h3 className="bold">Cohort:</h3><p>{props.otherUser.cohort !== null ? props.otherUser.cohort : 'Unknown'}</p>
            </>}
            {showEditForm && <form onSubmit={handleSubmit}>
            <ImageInput type='file' onChange={e => setProfilePicture(e.target.files[0])} id='imageInput'/>
            <ProOuter>
                <ProfileWrapper>
                    <label htmlFor='imageInput'>{props.otherUser.profile_picture ? (
                    <ProfileFilter>
                        <div className='editPicture'>
                            Edit
                            <FontAwesomeIcon icon={faCamera} className='fa-1x'/>
                        </div>
                        <ProfileImg  edit={true} style={{backgroundImage: `url('${props.otherUser.profile_picture}')`}}/>
                    </ProfileFilter>) : (
                    <ProfileFilter>
                        <div className='editPicture'>
                            Edit
                            <FontAwesomeIcon icon={faCamera} className='fa-1x'/>
                        </div>
                        <DefaultProfile edit={true} icon={faUserCircle}/>
                    </ProfileFilter>)}</label>
                </ProfileWrapper>
            </ProOuter>
            <label><h3 className="bold">Username:</h3>    
                <input className="text-input" name="username" onChange={handleChange} placeholder={props.otherUser.username} type="text"/> 
            </label>
            <div>
            </div>
            <label><h3 className="bold">Name:</h3>
                <input className="text-input" name="name" onChange={handleChange} placeholder={props.otherUser.name} />
            </label>
            <label><h3 className="bold">Email:</h3>
                <input className="text-input" name="email" type="email" onChange={handleChange} placeholder={props.otherUser.email !== null ? props.otherUser.email : ''} />
            </label> 
            <label><h3 className="bold">Cohort:</h3>
                <input className="text-input" name="cohort" type="text" onChange={handleChange} placeholder={props.otherUser.cohort !== null ? props.otherUser.cohort : ''} />
            </label>    
            <label><h3 className="bold">New password:</h3>
                    <input className="text-input" name="newPassword" onChange={handleChange} placeholder='' type="text"/> 
            </label>
           <PasswordDiv>
                <label>
                    <p>Re-enter password to save changes:</p>
                    <input className="text-input" type='password' name='password' onChange={passwordChange} />
                </label>
            </PasswordDiv> 
                <br /><br />
                <button className="button" type="submit">Submit changes</button>
            </form> }

            {isAdmin && <MarginButton className="button" onClick={() => setShowEditForm(!showEditForm)}>{showEditForm && 'Cancel'}{!showEditForm && 'Edit'}</MarginButton>}
            
            </StyledLoader>  
        </Div>
        </OuterDiv>
    )
}

const mapStateToProps = state => {
    // console.log('mapstatetoprops: ', state);
    return {
        currentUser: state.AppReducer.currentUser,
        otherUser: state.AppReducer.otherUser,
        loading: state.AppReducer.loading,
    }
  }

export default connect(mapStateToProps, { getOtherUser, loadingStart, loadingDone })(ViewAccount)


const StyledLoader = styled(LoadingOverlay)`
    width:100%;
`;
const OuterDiv = styled.div `
    width: 100%;
    flex-direction: column;
    align-items: center;
    background: #383651;
    justify-content: center;
`;
const Div = styled.div `
    width: 60%;
    flex-direction: column;
    align-items: center;
    background: white;
    margin: 10rem auto;
    padding: 3rem;
    text-align: center;
`;
const ProOuter = styled.div `
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const MarginButton = styled.button `
    margin-top: 25px;
`;
const PasswordDiv = styled.div `
    margin-top: 50px;
    font-style: italic;
    color: #BF0033;
`;
const ImageInput = styled.input `
    opacity: 0;
    position: absolute;
    pointer-events: none;
    width: 1px;
    height: 1px;
`;
const DefaultProfile = styled(FontAwesomeIcon) `
    position: absolute;
    width: 200px !important;
    height: 200px;
    /* border-radius: 50%; */
    background: white;
    ${props => props.edit && `
        &:hover {
                cursor: pointer;
                opacity: 0.2;
        }
    `
    }
`;
const ProfileImg = styled.div`
    position: absolute;
    /* border-radius: 50%; */
    width: 200px;
    height: 200px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%; 
    ${props => props.edit && `
        &:hover {
                cursor: pointer;
                opacity: 0.2;
        }
    `
    }
`;
const ProfileWrapper = styled.div `
    width: 200px;
    height: 200px;
    margin: 2rem;
`;
const ProfileFilter = styled.div `
    font-family: 'Patua One', sans-serif;
    width: 200px;
    height: 200px;
    /* border-radius: 50%; */
    display: flex;
    font-size: 3.5rem;
    align-items: center;
    justify-content: center;
    .editPicture {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`;