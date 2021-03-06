import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import axiosWithAuth from '../../../utils/axiosWithAuth';
import OpenTicket from './OpenTicket';

import styled from "styled-components";
import LoadingOverlay from "react-loading-overlay";
const StyledLoader = styled(LoadingOverlay)`
    min-height: 100vh;
    width:100%;
    z-index: 2;
`;

function OpenTicketList(props) {
    const [loading, setLoading] = useState(true);
    const [openTickets, setOpenTickets] = useState([]);

    useEffect(() => {
        axiosWithAuth().get('/tickets/open')
        .then(res => {
            // console.log('Open Ticket List res data: ', res.data);
            setOpenTickets(res.data);
            setLoading(false);
        })
        .catch(err => {console.log('CATCH ERROR: ', err.response.data.message);
        setLoading(false);
        alert(err.response.data.message)});
    }, []);


    return (
         <div className='helperDashboard'>
        <StyledLoader active={loading} spinner text='Loading...'>
            <table className='tickettable ticket-table-open'>
            {/* ticket-table-open */}
            {/* className="thead-open"  */}
                <thead className='thead-open'>
                    <tr className="tr-open">
                        <th className='firstTh stickyTH th-open' >Author</th>
                        <th className='stickyTH th-open'>Subject</th>
                        <th className='stickyTH th-open'>Title</th>
                        <th className='stickyTH th-open'>Age</th>
                        <th className='stickyTH th-open'>Link</th>
                    </tr>
                </thead>
                <tbody className="tbody-open">
                    {openTickets && openTickets.map(ticket => {
                      
                       let shouldReturn = true;
                       if(props.searchTerm){
                           if (props.searchType === 'Category' && ticket.category && !ticket.category.toLowerCase().includes(props.searchTerm.toLowerCase())){
                               shouldReturn = false; 
                           }
                           else if (props.searchType === 'author' && ticket.author_name && !ticket.author_name.toLowerCase().includes(props.searchTerm.toLowerCase())){
                                   shouldReturn = false;
                           }
                           else if (props.searchType === 'Helper' && ticket.helper_name && !ticket.helper_name.toLowerCase().includes(props.searchTerm.toLowerCase())){
                               shouldReturn = false;
                           }
                           else if (props.searchType === 'Title' && ticket.title && !ticket.title.toLowerCase().includes(props.searchTerm.toLowerCase())){
                               shouldReturn = false;
                           }
                           else if (props.searchType === 'Description' && ticket.description && !ticket.description.toLowerCase().includes(props.searchTerm.toLowerCase())){
                               shouldReturn = false;
                           }
                           else if (props.searchType === 'Solution' && ticket.solution && !ticket.solution.toLowerCase().includes(props.searchTerm.toLowerCase())){
                               shouldReturn = false;
                           }
                       }
                        if (shouldReturn === true){
                            return (
                                <tr className="tr-open" key={ticket.id}><OpenTicket id={ticket.id} currentUser={props.currentUser} author_id={ticket.author_id} author_name={ticket.author_name} category={ticket.category} 
                                title={ticket.title} description={ticket.description} created_at={ticket.created_at} author_image={ticket.author_image}/></tr> )
                        }
                        else{return null}
                        })}
                </tbody>
            </table> 
      </StyledLoader>
        </div>
    )
}

const mapStateToProps = state => {
    // console.log('mapstatetoprops: ', state);
    return {
        searchType: state.SearchReducer.searchType,
        searchTerm: state.SearchReducer.searchTerm,
    }
  }

export default connect(mapStateToProps, { })(OpenTicketList)