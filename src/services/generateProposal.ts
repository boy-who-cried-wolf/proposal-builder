
import { ProposalInput, ProposalSection } from '@/types/proposal';
import { toast } from 'sonner';
import { callGenerateProposalFunction, fetchUserProfileForProposal } from './apiService';
import { fallbackGenerateProposal } from '../utils/proposal/fallbackGenerator';

export const generateProposal = async (
  input: ProposalInput,
  onStreamUpdate?: (sections: ProposalSection[]) => void
): Promise<ProposalSection[]> => {
  try {
    // Get the current user's knowledge base and services if they're logged in
    const { knowledgeBase, userServices } = await fetchUserProfileForProposal();

    // Add the knowledge base to the input
    const enrichedInput = {
      ...input,
      knowledgeBase,
      userServices
    };

    // Call the API
    try {
      return await callGenerateProposalFunction(enrichedInput, onStreamUpdate);
    } catch (error: any) {
      console.error('Error in generateProposal:', error);

      // For demo/testing when the edge function isn't working,
      // let's fall back to local generation
      console.log('Falling back to local generation...');
      return fallbackGenerateProposal(input, onStreamUpdate);
    }

  } catch (error: any) {
    console.error('Error in generateProposal:', error);
    toast.error('Failed to generate proposal. Using fallback generator.');
    return fallbackGenerateProposal(input, onStreamUpdate);
  }
};
