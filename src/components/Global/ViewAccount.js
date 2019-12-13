import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getOtherUser } from '../../actions/AppActions.js';
import { isUsernameAvailable, isValidPassword, isValidUsername, validateInputs } from '../../utils/AppUtils.js';
import decode from 'jwt-decode';
import styled from 'styled-components';
import axiosWithAuth from '../../utils/axiosWithAuth';
import axios from 'axios';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faUserCircle, faCamera } from "@fortawesome/free-solid-svg-icons";
// import {faPencilAlt, faUserCircle, faCamera, faImages, faFileVideo} from "@fortawesome/free-solid-svg-icons";
import LoadingOverlay from "react-loading-overlay";

function ViewAccount(props) {
    const [loading, setLoading] = useState(true);
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [usernameInvalid, setUsernameInvalid] = useState(false);
    // const [usernameLoading, setUsernameLoading] = useState(false);
    const [isAdmin] = useState(decode(sessionStorage.getItem('token')).admin)
    const [showEditForm, setShowEditForm] = useState(false);
    // state for when the user edits their account details
    const [editUserName, setEditUserName] = useState('');
    const [editName, setEditName] = useState(props.otherUser.name);
    const [editEmail, setEditEmail] = useState(props.otherUser.email);
    const [editCohort, setEditCohort] = useState(props.otherUser.cohort);
    const [newPassword, setNewPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [verifyPassword, setVerifyPassword] = useState('');
// #region console logs
    // console.log('Current User', props.currentUser.id, 'Other User: ', props.match.params.id)
    // console.log('Decoded token', decode(sessionStorage.getItem('token')));
// #endregion

    useEffect(() => {
        if (!props.otherUser || props.match.params.id != props.otherUser.id){
            setLoading(true);
            props.getOtherUser(props.match.params.id);
        }
        else{
            setLoading(false);
        }
      }, [props.otherUser])

    const handleChange = e => {
        if (e.target.name === 'username'){
            if(isValidUsername(e.target.value))
            {
                setUsernameInvalid(false);
                isUsernameAvailable(e.target.value)
                .then(res => {
                setUsernameAvailable(res);
                })
            }
            else
            {
              setUsernameInvalid(true);
            }
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

        if (validateInputs(userObj) && (newPassword === '' || isValidPassword(newPassword))) {
            // console.log('passed validation');
            props.loadingStart();
        
            //call admin code first in case admin has special edit powers that normal user doesn't, admin should be able to use said powers
            //on themselves
            if (isAdmin)
            {
                
            }
            else if (props.currentUser.id == props.match.params.id){
                try{
                    promises.push(axiosWithAuth().put(`/admin/users/${props.match.params.id}`, userObj));
                
                    if(profilePicture){
                        const formData = new FormData();
                        formData.append('image', profilePicture);
                        console.log(profilePicture);
                        console.log(formData);
        
                        if(props.currentUser.profile_picture){
                            promises.push(axiosWithAuth().put('https://ddq.herokuapp.com/api/users/user/picture', formData));
                        }else{
                            promises.push(axiosWithAuth().post('https://ddq.herokuapp.com/api/users/user/picture', formData));
                        }
                    }
                    const response = await axios.all(promises);
                    if(response) { setLoading(false); }
                    }catch(err){
                        console.log("Edit Account Catch Error: ", err);
                        alert(err.response.data);
                        setLoading(false);
                    }
                }
            }
    }

    return (
        <OuterDiv>
        <Div className='card'> 
        <StyledLoader active={loading} spinner text='Uploading...'> 
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
                <div className='tooltip2'>
                 <input className="text-input" name="username" onChange={handleChange} placeholder={props.otherUser.username} type="text"/> 
                 <span className={editUserName ? (usernameInvalid ? 'taken' : (usernameAvailable ? 'available' : 'taken')) : null}>{editUserName ? (usernameInvalid ? 'invalid' : (usernameAvailable ? 'available': 'taken')) : null}</span>
                </div>
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

            {(props.currentUser.id == props.match.params.id || isAdmin) && <MarginButton className="button" onClick={() => setShowEditForm(!showEditForm)}>{showEditForm && 'Cancel'}{!showEditForm && 'Edit'}</MarginButton>}
            
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
    }
  }

export default connect(mapStateToProps, { getOtherUser })(ViewAccount)


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