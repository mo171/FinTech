import { getActivePolicy,  evaluate} from '../services/policy.service.js';
import { ApiResponse } from '../utils/apiResponse.js';


const evaluateRequest = async (req, res) => {
  const {type, query, documentQuery} = req.body;

  const policy = await getActivePolicy(query);

/* BUSINESS LOGIC TO BE ADDED HERE
    - Check if policy exists
    - proccess the policy data as per user request
       - user ke end pe use agentic a.i from there we will we will fine tune it to send a json response
          ki {
               "type": "privacy_policy",
               "query": "data retention period"
               "document-related query":""
            }
            
        - the recieved request will be proccessed to find relevant section in the policy document by A.I agent
        - finally the response will be sent back to user
*/
    
 const response = await evaluate(type, policy, query, documentQuery);
    
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
           response: response
        },
        "policy evaluated successfully",
      ),
    );
};

export { evaluateRequest };