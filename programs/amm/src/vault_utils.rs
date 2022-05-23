use anchor_lang::prelude::*;

#[derive(Clone)]
pub struct MercurialVault;

impl anchor_lang::Id for MercurialVault {
    fn id() -> Pubkey {
        mercurial_vault::id()
    }
}
