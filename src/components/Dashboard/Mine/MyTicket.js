import React from "react";
import { Link } from 'react-router-dom';
import * as timeago from 'timeago.js';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
// import {faPencilAlt, faUserCircle, faCamera, faImages, faFileVideo} from "@fortawesome/free-solid-svg-icons";
import styled from 'styled-components';

const Fa = styled(FontAwesomeIcon)`
    width: 70px !important;
    height: 70px;
`

export default function MyTicket(props) { 
    //display teacher and author on mine list

    // let curUser;
    // let secondUser = 'FIX ME Myticket.js';
    // console.log(props)
    // if (props.status === 'open'){
    //     curUser = props.currentUser.name;
    // }
    // else if (props.data === 'assigned')
    // {
    //     if (props.currentUser === props.author_name){
    //         curUser = props.author_name;
    //     }
    //     if (props.currentUser === props.author_name){
    //         curUser = props.author_name;
    //     }
    // }
    // else if (props.data === 'resolved')
    // {
    //     if (props.currentUser === props.author_name){
    //         curUser = props.author_name;
    //     }
    //     if (props.currentUser === props.author_name){
    //         curUser = props.author_name;
    //     }
    // }


    return (
        <>
             {/* <td className='boldrows'>{props.author_name}</td>  */}
             <td><div>{props.author_image ? <img className="photo" src={props.author_image} alt='author'/> : <Fa icon={faUserCircle}/>}
             {props.helper_image ? <img className="photo2" src={props.helper_image} alt='Helper'/> : <Fa icon={faUserCircle}/>}</div><div>{props.author_name}</div></td>
            <td className='boldrows'>{props.category}</td>
            <td>{props.title}</td>
            {/* <td>{props.description}</td> */}
            <td>{timeago.format(props.created_at)}</td>
            <td><Link to={`/Dashboard/Tickets/${props.id}`}>View</Link></td>
        </>
    
    )
}

