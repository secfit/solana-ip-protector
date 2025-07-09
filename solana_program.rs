// Solana Program for IP Protection
// This would be the actual Rust program deployed on Solana

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("YourProgramIdHere");

#[program]
pub mod ip_protector {
    use super::*;

    pub fn initialize_paper(
        ctx: Context<InitializePaper>,
        author: Pubkey,
        paper_hash: String,
        sections_count: u8,
    ) -> Result<()> {
        let paper_account = &mut ctx.accounts.paper_account;
        paper_account.author = author;
        paper_account.paper_hash = paper_hash;
        paper_account.sections_count = sections_count;
        paper_account.created_at = Clock::get()?.unix_timestamp;
        paper_account.bump = *ctx.bumps.get("paper_account").unwrap();
        Ok(())
    }

    pub fn create_section_token(
        ctx: Context<CreateSectionToken>,
        section_type: String,
        content_hash: String,
        uniqueness_score: u8,
        summary: String,
    ) -> Result<()> {
        let section_account = &mut ctx.accounts.section_account;
        section_account.author = ctx.accounts.author.key();
        section_account.section_type = section_type;
        section_account.content_hash = content_hash;
        section_account.uniqueness_score = uniqueness_score;
        section_account.summary = summary;
        section_account.created_at = Clock::get()?.unix_timestamp;
        section_account.bump = *ctx.bumps.get("section_account").unwrap();
        Ok(())
    }

    pub fn verify_authorship(
        ctx: Context<VerifyAuthorship>,
        content_hash: String,
    ) -> Result<bool> {
        let section_account = &ctx.accounts.section_account;
        Ok(section_account.content_hash == content_hash && 
           section_account.author == ctx.accounts.author.key())
    }
}

#[derive(Accounts)]
#[instruction(author: Pubkey, paper_hash: String)]
pub struct InitializePaper<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + PaperAccount::INIT_SPACE,
        seeds = [b"paper", author.as_ref(), paper_hash.as_bytes()],
        bump
    )]
    pub paper_account: Account<'info, PaperAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(section_type: String, content_hash: String)]
pub struct CreateSectionToken<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + SectionAccount::INIT_SPACE,
        seeds = [b"section", author.key().as_ref(), section_type.as_bytes(), content_hash.as_bytes()],
        bump
    )]
    pub section_account: Account<'info, SectionAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is the author's public key
    pub author: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content_hash: String)]
pub struct VerifyAuthorship<'info> {
    #[account(
        seeds = [b"section", author.key().as_ref(), section_account.section_type.as_bytes(), content_hash.as_bytes()],
        bump = section_account.bump
    )]
    pub section_account: Account<'info, SectionAccount>,
    /// CHECK: This is the author's public key
    pub author: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct PaperAccount {
    pub author: Pubkey,
    #[max_len(64)]
    pub paper_hash: String,
    pub sections_count: u8,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct SectionAccount {
    pub author: Pubkey,
    #[max_len(32)]
    pub section_type: String,
    #[max_len(64)]
    pub content_hash: String,
    pub uniqueness_score: u8,
    #[max_len(500)]
    pub summary: String,
    pub created_at: i64,
    pub bump: u8,
}

#[error_code]
pub enum IPProtectorError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid content hash")]
    InvalidContentHash,
    #[msg("Section already exists")]
    SectionExists,
}